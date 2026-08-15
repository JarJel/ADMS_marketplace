<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Get list of admin audit logs.
     */
    public function getAuditLogs()
    {
        // Eager load the 'admin' relationship to fetch who made the changes
        $logs = AdminAuditLog::with('admin')
            ->orderBy('created_at', 'desc')
            ->paginate(30);

        return response()->json([
            'success' => true,
            'message' => 'Log audit admin berhasil diambil.',
            'data' => $logs
        ], 200);
    }
}
