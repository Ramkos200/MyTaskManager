// Import React and necessary hooks
import { useState, useEffect } from 'react';

// Import Inertia.js components for routing and form handling
import { Head, Link, useForm } from '@inertiajs/react';

// Import icons from Lucide React library
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Calendar, CheckCircle, List as ListIcon } from 'lucide-react';

// Import layout and custom UI components
import AppLayout from '@layouts/app-layout';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Textarea } from '@components/ui/textarea';

// Import TypeScript type definitions
import { type BreadcrumbItem } from '@types';

// Define interface for a Task object
interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: string | null;
  lists_id: number;
}

// Define interface for a TaskList object
interface TaskList {
  id: number;
  title: string;
  description: string;
  tasks_count?: number;
  tasks?: Task[]; // Add tasks property to store tasks for the list
}

// Define interface for component props
interface PageProps {
  lists: TaskList[];
  flash?: {
    success?: string;
    error?: string;
  };
}

// Define breadcrumb navigation items
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Lists',
    href: '/lists',
  },
];

// Main component function
export default function ListsIndex({ lists, flash }: PageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<TaskList | null>(null);
  const [selectedList, setSelectedList] = useState<TaskList | null>(null); // State for selected list
  const [isTasksDialogOpen, setIsTasksDialogOpen] = useState(false); // State for tasks dialog
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const listForm = useForm({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (flash?.success) {
      showToast(flash.success, 'success');
    } else if (flash?.error) {
      showToast(flash.error, 'error');
    }
  }, [flash]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingList) {
      listForm.put(`/lists/${editingList.id}`, {
        onSuccess: () => {
          closeDialogAndResetForm();
        },
      });
    } else {
      listForm.post('/lists', {
        onSuccess: () => {
          closeDialogAndResetForm();
        },
      });
    }
  };

  const closeDialogAndResetForm = () => {
    setIsDialogOpen(false);
    listForm.reset();
    setEditingList(null);
  };

  const handleEditList = (list: TaskList) => {
    setEditingList(list);
    listForm.setData({
      title: list.title,
      description: list.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDeleteList = (listId: number) => {
    if (confirm('Are you sure you want to delete this list?')) {
      listForm.delete(`/lists/${listId}`);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      closeDialogAndResetForm();
    }
  };

  // Function to handle list card click
  const handleListClick = async (list: TaskList) => {
    setSelectedList(list);

    // If tasks aren't already loaded, fetch them
    if (!list.tasks) {
      try {
        // Use the correct endpoint format
        const response = await fetch(`/lists/${list.id}/tasks`);

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const tasks = await response.json();
        setSelectedList({ ...list, tasks });
      } catch (error) {
        showToast('Failed to load tasks', 'error');
        console.error('Error fetching tasks:', error);
      }
    }

    setIsTasksDialogOpen(true);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Task Lists" />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {toast.show && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
          />
        )}

        <PageHeader
          onAddList={() => setIsDialogOpen(true)}
        />

        <ListDialog
          isOpen={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          isEditing={!!editingList}
          formData={listForm.data}
          onFormChange={listForm.setData}
          onSubmit={handleFormSubmit}
          isProcessing={listForm.processing}
        />

        {/* Tasks Dialog for showing tasks in a list */}
        <TasksDialog
          isOpen={isTasksDialogOpen}
          onOpenChange={setIsTasksDialogOpen}
          list={selectedList}
        />

        <ListsGrid
          lists={lists}
          onEditList={handleEditList}
          onDeleteList={handleDeleteList}
          onListClick={handleListClick} // Pass click handler
        />
      </div>
    </AppLayout>
  );
}

// Toast Notification Component
function ToastNotification({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
      } text-white animate-in fade-in slide-in-from-top-5`}>
      {type === 'success' ? (
        <CheckCircle2 className="h-5 w-5" />
      ) : (
        <XCircle className="h-5 w-5" />
      )}
      <span>{message}</span>
    </div>
  );
}

// Page Header Component
function PageHeader({ onAddList }: { onAddList: () => void }) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Your Task Lists</h1>
      <Button onClick={onAddList}>
        <Plus className="h-4 w-4 mr-2" />
        New List
      </Button>
    </div>
  );
}
//cards color generator
const getCardColor = (index: number) => {
  const colors = [
    'bg-blue-100 border-blue-200 hover:bg-blue-200/50',
    'bg-green-100 border-green-200 hover:bg-green-200/50',
    'bg-yellow-100 border-yellow-200 hover:bg-yellow-200/50',
    'bg-red-100 border-red-200 hover:bg-red-200/50',
    'bg-purple-100 border-purple-200 hover:bg-purple-200/50',
    'bg-pink-100 border-pink-200 hover:bg-pink-200/50',
    'bg-indigo-100 border-indigo-200 hover:bg-indigo-200/50',
    'bg-teal-100 border-teal-200 hover:bg-teal-200/50',
    'bg-orange-100 border-orange-200 hover:bg-orange-200/50',
    'bg-cyan-100 border-cyan-200 hover:bg-cyan-200/50',
  ];

  return colors[index % colors.length];
};

// Props interface for ListDialog component
interface ListDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: { title: string; description: string };
  onFormChange: (field: string, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isProcessing: boolean;
}

// List Dialog Component
function ListDialog({
  isOpen,
  onOpenChange,
  isEditing,
  formData,
  onFormChange,
  onSubmit,
  isProcessing
}: ListDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Task List' : 'Create New Task List'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">List Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => onFormChange('title', e.target.value)}
                placeholder="Enter list title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onFormChange('description', e.target.value)}
                placeholder="Describe your list (optional)"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : (isEditing ? 'Update List' : 'Create List')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Props interface for TasksDialog component
interface TasksDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  list: TaskList | null;
}

// Tasks Dialog Component - shows tasks in a selected list
function TasksDialog({ isOpen, onOpenChange, list }: TasksDialogProps) {
  if (!list) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListIcon className="h-5 w-5" />
            {list.title}
          </DialogTitle>
          <DialogDescription>
            {list.description || 'No description provided'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {list.tasks && list.tasks.length > 0 ? (
            <div className="space-y-3">
              {list.tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No tasks in this list yet.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Task Item Component - displays individual task in the tasks dialog
function TaskItem({ task }: { task: Task }) {
  // Function to truncate text to first 10 words
  const truncateText = (text: string | null, maxWords: number) => {
    if (!text) return '';

    const words = text.split(' ');
    if (words.length <= maxWords) {
      return text;
    }

    return words.slice(0, maxWords).join(' ') + '...';
  };

  return (
    <div className={`p-3 rounded-lg border ${task.is_completed ? 'bg-muted/50' : 'bg-background'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {truncateText(task.description, 10)}
            </p>
          )}
        </div>
        {task.is_completed && (
          <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
        )}
      </div>
      {task.due_date && (
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          Due: {new Date(task.due_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

// Props interface for ListsGrid component
interface ListsGridProps {
  lists: TaskList[];
  onEditList: (list: TaskList) => void;
  onDeleteList: (listId: number) => void;
  onListClick: (list: TaskList) => void; // Add click handler prop
}

// Lists Grid Component
function ListsGrid({ lists, onEditList, onDeleteList, onListClick }: ListsGridProps) {
  if (lists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No lists yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {lists.map((list, index) => ( // Add index parameter
        <ListCard
          key={list.id}
          list={list}
          onEdit={onEditList}
          onDelete={onDeleteList}
          onClick={onListClick}
          index={index} // Pass the index to ListCard
        />
      ))}
    </div>
  );

}

// List Card Component
function ListCard({
  list,
  onEdit,
  onDelete,
  onClick,
  index // Add index prop
}: {
  list: TaskList;
  onEdit: (list: TaskList) => void;
  onDelete: (listId: number) => void;
  onClick: (list: TaskList) => void;
  index: number; // Add index to determine color
}) {
  const cardColor = getCardColor(index);

  return (
    <Card
      className={`${cardColor} transition-colors cursor-pointer`} // Apply color classes
      onClick={() => onClick(list)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium line-clamp-1 text-black">
          {list.title}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(list);
            }}
            title="Edit list"
          >
            <Pencil className="h-4 w-4 text-black" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(list.id);
            }}
            className="text-destructive hover:text-destructive/90"
            title="Delete list"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm  line-clamp-2 text-gray-500">
          {list.description || 'No description provided'}
        </p>

        {list.tasks_count !== undefined && (
          <p className="text-sm text-muted-foreground mt-2">
            {list.tasks_count} task{list.tasks_count !== 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
