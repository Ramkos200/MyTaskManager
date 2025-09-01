<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use inertia\Inertia;
use App\Models\TaskList;
use Illuminate\Support\Facades\Auth;

class ListController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $lists = TaskList::where('user_id', Auth::id())->get();

        return Inertia::render('Lists/index', [
            'lists' => $lists,
            'flash' => ['success' => session('success'), 'error' => session('error')],
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

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);
        $validated['user_id'] = Auth::id();
        $list = TaskList::create($validated);
        return redirect()->route('lists.index')->with('success', 'List Created Successfully');
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
    public function update(Request $request, TaskList $list)
    {
        //


        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',

        ]);
        $validated['user_id'] = Auth::id();
        $list->update($validated);

        return redirect()->route('lists.index')->with('success', 'List updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaskList $list)
    {
        //
        $list->delete();
        return redirect()->route('lists.index')->with('success', 'List Deleted Successfully');
    }
}
