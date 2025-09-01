<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Task;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class TaskList extends Model
{
    //
    protected $table = 'lists';
    protected $fillable = [
        'title',
        'description',
        'user_id'
    ];
    function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
    function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
