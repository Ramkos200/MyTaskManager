<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\TaskList;

class Task extends Model
{
    //
    protected $fillable = [
        'title',
        'description',
        'is_completed',
        'due_date',
        'lists_id'
    ];
    function list(): BelongsTo
    {
        return $this->belongsTo(TaskList::class, 'lists_id');
    }
}
