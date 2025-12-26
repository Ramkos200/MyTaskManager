import { Head } from '@inertiajs/react';
import AppLayout from '@layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { CheckCircle, Clock, List, CheckSquare, Folder, AlertCircle, Calendar } from 'lucide-react';
import { Link, router } from '@inertiajs/react';

interface TaskList {
    id: number;
    title: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface Task {
    id: number;
    title: string;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
    list?: {
        id: number;
        title: string;
    };
}

interface Props {
    stats: {
        totalLists: number;
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
    };
    lists: TaskList[];
    tasks: Task[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Dashboard({ stats, lists, tasks, flash }: Props) {
    // Sort lists by most recently created or modified
    const sortedLists = [...lists].sort((a, b) => {
        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
    });

    // Sort tasks by most recently created or modified
    const sortedTasks = [...tasks].sort((a, b) => {
        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
    });

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Handle list click - navigate to tasks page filtered by this list
    const handleViewList = (listId: number) => {
        router.get('/tasks', {
            list_id: listId // Add filter parameter for the specific list
        });
    };

    return (
        <AppLayout>
            <Head title="Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-gray-900">
                {/* Stats Cards with Dark Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Lists Card - Dark Blue */}
                    <Card className="border-blue-800 bg-blue-900/50 hover:bg-blue-900/70 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-300">Total Lists</CardTitle>
                            <List className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-100">{stats.totalLists}</div>
                            <p className="text-xs text-blue-300 mt-1">Your collections</p>
                        </CardContent>
                    </Card>

                    {/* Total Tasks Card - Dark Indigo */}
                    <Card className="border-indigo-800 bg-indigo-900/50 hover:bg-indigo-900/70 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-300">Total Tasks</CardTitle>
                            <CheckSquare className="h-4 w-4 text-indigo-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-100">{stats.totalTasks}</div>
                            <p className="text-xs text-indigo-300 mt-1">All tasks</p>
                        </CardContent>
                    </Card>

                    {/* Completed Tasks Card - Dark Green */}
                    <Card className="border-green-800 bg-green-900/50 hover:bg-green-900/70 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-300">Completed Tasks</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-100">{stats.completedTasks}</div>
                            <p className="text-xs text-green-300 mt-1">
                                {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% done
                            </p>
                        </CardContent>
                    </Card>

                    {/* Pending Tasks Card - Dark Orange */}
                    <Card className="border-orange-800 bg-orange-900/50 hover:bg-orange-900/70 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-orange-300">Pending Tasks</CardTitle>
                            <Clock className="h-4 w-4 text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-100">{stats.pendingTasks}</div>
                            <p className="text-xs text-orange-300 mt-1">
                                {stats.totalTasks > 0 ? Math.round((stats.pendingTasks / stats.totalTasks) * 100) : 0}% remaining
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent Lists Card - Dark Purple */}
                    <Card className="border-purple-800 bg-purple-900/50">
                        <CardHeader className="border-b border-purple-700">
                            <CardTitle className="text-purple-200 flex items-center gap-2">
                                <Folder className="h-5 w-5" />
                                Recent Lists
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {sortedLists && sortedLists.length > 0 ? (
                                <div className="space-y-3">
                                    {sortedLists.slice(0, 5).map((list) => (
                                        <div key={list.id} className="flex items-center justify-between p-3 border border-purple-700 rounded-lg bg-purple-800/30 hover:bg-purple-800/50 transition-colors">
                                            <div className="flex-1">
                                                <span className="font-medium text-purple-100 block">{list.title}</span>
                                                <div className="flex items-center gap-2 text-xs text-purple-300 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Updated: {formatDate(list.updated_at || list.created_at)}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleViewList(list.id)}
                                                className="text-purple-300 hover:text-purple-100 underline text-sm whitespace-nowrap bg-purple-700 hover:bg-purple-600 px-3 py-1 rounded-md transition-colors"
                                            >
                                                View Tasks
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-purple-400 py-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <p>No lists yet</p>
                                </div>
                            )}
                            <div className="mt-4 pt-3 border-t border-purple-700">
                                <Link 
                                    href="/lists"
                                    className="text-purple-300 hover:text-purple-100 font-medium flex items-center gap-1"
                                >
                                    View all lists →
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Tasks Card - Dark Gray */}
                    <Card className="border-gray-700 bg-gray-800/50">
                        <CardHeader className="border-b border-gray-600">
                            <CardTitle className="text-gray-200 flex items-center gap-2">
                                <CheckSquare className="h-5 w-5" />
                                Recent Tasks
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {sortedTasks && sortedTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {sortedTasks.slice(0, 5).map((task) => (
                                        <div key={task.id} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                                            <div className="flex-1">
                                                <span className="font-medium text-gray-100 block">{task.title}</span>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-sm text-gray-300">
                                                        {task.list ? (
                                                            <span className="flex items-center gap-1">
                                                                <List className="h-3 w-3" />
                                                                {task.list.title}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">No list assigned</span>
                                                        )}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{formatDate(task.updated_at || task.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ml-2 ${
                                                task.is_completed 
                                                    ? 'bg-green-800/50 text-green-300 border border-green-700' 
                                                    : 'bg-orange-800/50 text-orange-300 border border-orange-700'
                                            }`}>
                                                {task.is_completed ? 'Completed' : 'Pending'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-400 py-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <p>No tasks yet</p>
                                </div>
                            )}
                            <div className="mt-4 pt-3 border-t border-gray-600">
                                <Link 
                                    href="/tasks"
                                    className="text-gray-300 hover:text-gray-100 font-medium flex items-center gap-1"
                                >
                                    View all tasks →
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}