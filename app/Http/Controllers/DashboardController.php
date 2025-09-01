<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\TaskList;
use Inertia\Inertia;
use App\Models\Task;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $user = Auth::user();

        $lists = TaskList::where('user_id', $user->id)
            ->orderBy('updated_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'title', 'description', 'created_at', 'updated_at']);

        $tasks = Task::with(['list' => function ($query) {
            $query->select('id', 'title');
        }])
            ->whereHas('list', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->orderBy('updated_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'title', 'is_completed', 'lists_id', 'created_at', 'updated_at']);

        $stats = [
            'totalLists' => $lists->count(),
            'totalTasks' => $tasks->count(),
            'completedTasks' => $tasks->where('is_completed', true)->count(),
            'pendingTasks' => $tasks->where('is_completed', false)->count(),
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'lists' => $lists,
            'tasks' => $tasks,
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
