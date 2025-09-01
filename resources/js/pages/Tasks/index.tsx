// Import React and framework dependencies
import { Head, router, Link } from '@inertiajs/react'; // Inertia.js components for routing and head management
import { Button } from '@components/ui/button'; // Custom button component
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'; // Card components for UI
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Calendar, List, CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react'; // Icon library for UI elements
import AppLayout from '@layouts/app-layout'; // Main application layout component
import { type BreadcrumbItem } from '@/types'; // Type definition for breadcrumb items
import { useState, useEffect } from 'react'; // React hooks for state and side effects
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'; // Modal dialog components
import { Input } from '@components/ui/input'; // Input field component
import { Label } from '@components/ui/label'; // Label component for forms
import { Textarea } from '@components/ui/textarea'; // Textarea component
import { useForm } from '@inertiajs/react'; // Form handling hook from Inertia
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'; // Dropdown select components

// Interface defining the structure of a Task object
interface Task {
    id: number; // Unique identifier for the task
    title: string; // Task title
    description: string | null; // Task description (optional)
    is_completed: boolean; // Completion status
    due_date: string | null; // Due date (optional)
    lists_id: number; // Foreign key linking to the list this task belongs to
    list: { // Nested list object
        id: number; // List ID
        title: string; // List title
    };
}

// Interface defining the structure of a List object
interface List {
    id: number; // Unique identifier for the list
    title: string; // List title
}

// Interface defining the component props structure
interface Props {
    tasks: { // Paginated tasks data from server
        data: Task[]; // Array of tasks for current page
        current_page: number; // Current page number
        last_page: number; // Total number of pages
        per_page: number; // Number of items per page
        total: number; // Total number of tasks
        from: number; // Starting index of current page
        to: number; // Ending index of current page
    };
    lists: List[]; // Array of all user's lists
    filters: { // Current filter values
        search: string; // Search query string
        filter: string; // Completion status filter
    };
    flash?: { // Optional flash messages for notifications
        success?: string; // Success message
        error?: string; // Error message
    };
}

// Breadcrumb navigation items
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasks', // Display text
        href: '/tasks', // URL path
    },
];

// Main Tasks Index component
export default function Tasksindex({ tasks, lists, filters, flash }: Props) {
    // State management for UI components
    const [isOpen, setIsOpen] = useState(false); // Controls dialog visibility
    const [editingTask, setEditingTask] = useState<Task | null>(null); // Currently edited task (null for new tasks)
    const [showToast, setShowToast] = useState(false); // Controls toast notification visibility
    const [toastMessage, setToastMessage] = useState(''); // Toast message content
    const [toastType, setToastType] = useState<'success' | 'error'>('success'); // Toast type (success/error)
    const [searchTerm, setSearchTerm] = useState(filters.search); // Search input value
    const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'pending'>(filters.filter as 'all' | 'completed' | 'pending'); // Completion filter state

    // Effect to handle flash messages from server
    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setToastType('success');
            setShowToast(true);
        } else if (flash?.error) {
            setToastMessage(flash.error);
            setToastType('error');
            setShowToast(true);
        }
    }, [flash]); // Runs when flash prop changes

    // Effect to auto-hide toast after 3 seconds
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 3000);
            return () => clearTimeout(timer); // Cleanup timer on unmount
        }
    }, [showToast]); // Runs when toast visibility changes

    // Form handling using Inertia's useForm hook
    const { data, setData, post, put, processing, reset, delete: destroy } = useForm({
        title: '', // Task title
        description: '', // Task description
        due_date: '', // Due date
        lists_id: '', // Selected list ID
        is_completed: false, // Completion status
    });

    // Handle form submission for both create and update
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission
        if (editingTask) {
            // Update existing task
            put(`/tasks/${editingTask.id}`, {
                onSuccess: () => {
                    setIsOpen(false); // Close dialog
                    reset(); // Reset form fields
                    setEditingTask(null); // Clear editing state
                },
            });
        } else {
            // Create new task
            post('/tasks', {
                onSuccess: () => {
                    setIsOpen(false); // Close dialog
                    reset(); // Reset form fields
                },
            });
        }
    };

    // Handle editing a task - populate form with existing data
    const handleEdit = (task: Task) => {
        setEditingTask(task); // Set the task being edited
        setData({ // Pre-fill form with task data
            title: task.title,
            description: task.description || '', // Handle null description
            due_date: task.due_date || '', // Handle null due date
            lists_id: task.lists_id.toString(), // Convert ID to string for select input
            is_completed: task.is_completed, // Set completion status
        });
        setIsOpen(true); // Open the dialog
    };

    // Handle deleting a task
    const handleDelete = (taskId: number) => {
        destroy(`/tasks/${taskId}`); // Send DELETE request
    };

    // Handle search form submission
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission
        router.get('/tasks', { // Navigate with search parameters
            search: searchTerm, // Search query
            filter: completionFilter, // Current filter
        }, {
            preserveState: true, // Keep current component state
            preserveScroll: true, // Maintain scroll position
        });
    };

    // Handle filter change (all/completed/pending)
    const handleFilterChange = (value: 'all' | 'completed' | 'pending') => {
        setCompletionFilter(value); // Update filter state
        router.get('/tasks', { // Navigate with new filter
            search: searchTerm, // Current search term
            filter: value, // New filter value
        }, {
            preserveState: true, // Keep component state
            preserveScroll: true, // Maintain scroll position
        });
    };

    // Handle pagination - navigate to specific page
    const handlePageChange = (page: number) => {
        router.get('/tasks', { // Navigate to specific page
            page, // Page number
            search: searchTerm, // Current search term
            filter: completionFilter, // Current filter
        }, {
            preserveState: true, // Keep component state
            preserveScroll: true, // Maintain scroll position
        });
    };

    // Main component render
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Set page title in document head */}
            <Head title="Tasks" />
            
            {/* Main content container */}
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-black from-background to-muted">
                {/* Toast notification component */}
                {showToast && (
                    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg ${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white animate-in fade-in slide-in-from-top-5`}>
                        {toastType === 'success' ? (
                            <CheckCircle2 className="h-5 w-5" />
                        ) : (
                            <XCircle className="h-5 w-5" />
                        )}
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* Header section with title and create button */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    
                    {/* Dialog for creating/editing tasks */}
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild> 
                            <Button className="bg-primary hover:bg-primary/90 text-black shadow-lg">
                                <Plus className="h-4 w-4 mr-2" />
                                New Task
                            </Button>
                        </DialogTrigger>
                        
                        {/* Dialog content */}
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="text-xl">
                                    {editingTask ? 'Edit Task' : 'Create New Task'}
                                </DialogTitle>
                            </DialogHeader>
                            
                            {/* Task form */}
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    {/* Title input field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            required
                                            className="focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    
                                    {/* Description textarea */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    
                                    {/* List selection dropdown */}
                                    <div className="space-y-2">
                                        <Label htmlFor="lists_id">List</Label>
                                        <Select onValueChange={(value) => setData('lists_id', value)} value={data.lists_id}>
                                            <SelectTrigger className="focus:ring-2 focus:ring-primary">
                                                <SelectValue placeholder="Select a list" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {lists.map((list) => (
                                                    <SelectItem key={list.id} value={list.id.toString()}>
                                                        {list.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    {/* Due date input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="due_date">Due Date</Label>
                                        <Input
                                            type="date"
                                            id="due_date"
                                            value={data.due_date}
                                            onChange={(e) => setData('due_date', e.target.value)}
                                            className="focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    
                                    {/* Completion status checkbox */}
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="is_completed"
                                            checked={data.is_completed}
                                            onChange={(e) => setData('is_completed', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-primary"
                                        />
                                        <Label htmlFor="is_completed">Completed</Label>
                                    </div>
                                    
                                    {/* Submit button */}
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-primary hover:bg-primary/90 text-black shadow-lg"
                                    >
                                        {editingTask ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search and filter controls */}
                <div className="flex gap-4 mb-4">
                    {/* Search form */}
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </form>
                    
                    {/* Filter dropdown */}
                    <Select value={completionFilter} onValueChange={handleFilterChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tasks</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Tasks table */}
                <div className="rounded-md border">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            {/* Table header */}
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">List</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Due Date</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            
                            {/* Table body with task data */}
                            <tbody className="[&_tr:last-child]:border-0">
                                {tasks.data.map((task) => (
                                    <tr key={task.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{task.title}</td>
                                        <td className="p-4 align-middle max-w-[200px] truncate">
                                            {task.description || 'No description'}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-2">
                                                <List className="h-4 w-4 text-muted-foreground" />
                                                {task.list.title}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {task.due_date ? (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {new Date(task.due_date).toLocaleDateString()}
                                                </div>
                                            ) : 'No due date'}
                                        </td>
                                        <td className="p-4 align-middle">
                                            {task.is_completed ? (
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Completed
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-yellow-600">
                                                    Pending
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Edit button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(task)}
                                                    className="hover:bg-primary/10 hover:text-primary"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                {/* Delete button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(task.id)}
                                                    className="hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                
                                {/* Empty state message */}
                                {tasks.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                            No tasks found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination controls */}
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground">
                        Showing {tasks.from} to {tasks.to} of {tasks.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Previous page button */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(tasks.current_page - 1)}
                            disabled={tasks.current_page === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        {/* Page number buttons */}
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: tasks.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === tasks.current_page ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                        
                        {/* Next page button */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(tasks.current_page + 1)}
                            disabled={tasks.current_page === tasks.last_page}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}