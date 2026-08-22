import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

export default function SearchBar({ 
    onSelect, 
    placeholder = "Cari mobil bekas, handphone, laptop...", 
    apiEndpoint = "/api/public/ads/search",
    queryParam = "q",
    onSearchChange,
    containerClassName = "w-full flex items-center bg-slate-50 dark:bg-[#05131b] border-2 border-slate-200 dark:border-[#174256] rounded-xl p-3 pl-4 focus-within:border-amber-400 dark:focus-within:border-[#FFBF00] transition-colors relative z-20",
    inputClassName = "w-full bg-transparent text-slate-900 dark:text-white focus:outline-none text-xs sm:text-sm placeholder-slate-400 font-medium"
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const debouncedQuery = useDebounce(query, 150);
    const searchRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Autocomplete fetch logic
    useEffect(() => {
        if (debouncedQuery.trim().length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        // Cancel previous pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);

        const url = apiEndpoint.includes('?') 
            ? `${apiEndpoint}&${queryParam}=${encodeURIComponent(debouncedQuery)}`
            : `${apiEndpoint}?${queryParam}=${encodeURIComponent(debouncedQuery)}`;

        fetch(url, {
            signal: controller.signal
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setResults(Array.isArray(data.data) ? data.data : data.data.data || []);
                }
            })
            .catch(err => {
                if (err.name !== 'AbortError') {
                    console.error('Search failed:', err);
                }
            })
            .finally(() => {
                setLoading(false);
            });

        return () => {
            controller.abort();
        };
    }, [debouncedQuery]);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!showDropdown || results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < results.length) {
                handleItemClick(results[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    const handleItemClick = (item) => {
        setQuery(item.title);
        setShowDropdown(false);
        if (onSearchChange) onSearchChange(item.title);
        if (onSelect) {
            onSelect(item);
        }
    };

    // Helper to highlight matching text
    const highlightText = (text, highlight) => {
        if (!highlight.trim()) return text;
        const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, index) => 
            regex.test(part) 
                ? <strong key={index} className="text-amber-500 dark:text-[#FFBF00] font-black">{part}</strong> 
                : part
        );
    };

    return (
        <div ref={searchRef} className="relative w-full" onKeyDown={handleKeyDown}>
            <div className={containerClassName}>
                <Search className="w-4 h-4 text-amber-500 dark:text-[#FFBF00] mr-2.5 flex-shrink-0" />
                <input 
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                        setActiveIndex(-1);
                        if (onSearchChange) onSearchChange(e.target.value);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={placeholder}
                    className={inputClassName}
                />
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && query.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#071922] border-2 border-slate-200 dark:border-[#174256] rounded-2xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                    {loading && results.length === 0 ? (
                        /* Skeleton Loader when loading and no old results exist */
                        <div className="p-3 space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                                        <div className="h-2 bg-slate-100 dark:bg-[#174256] rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : results.length === 0 ? (
                        /* Empty State */
                        <div className="p-5 text-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                            Tidak ditemukan hasil untuk <strong className="text-[#0F3040] dark:text-white font-bold">"{query}"</strong>
                        </div>
                    ) : (
                        /* Results list with opacity effect during load to avoid flickering */
                        <div className={`divide-y divide-slate-100 dark:divide-[#174256]/50 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                            {results.map((item, idx) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    onMouseEnter={() => setActiveIndex(idx)}
                                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors text-left ${
                                        idx === activeIndex 
                                            ? 'bg-amber-500/10 dark:bg-[#174256]/60' 
                                            : 'hover:bg-slate-50 dark:hover:bg-[#0F3040]/30'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/50 dark:border-slate-700/50">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                            {highlightText(item.title, query)}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                            <span className="text-amber-600 dark:text-[#FFBF00] font-bold">
                                                Rp{new Intl.NumberFormat('id-ID').format(item.price)}
                                            </span>
                                            <span>•</span>
                                            <span>{item.category}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
