// Import React and necessary hooks
import { useState, useEffect } from 'react';

// Import Inertia.js components for routing and form handling
import { Head, Link, useForm } from '@inertiajs/react';

// Import icons from Lucide React library
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';

// Import layout and custom UI components
import AppLayout from '@layouts/app-layout';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Textarea } from '@components/ui/textarea';

// Import TypeScript type definitions
import { type BreadcrumbItem } from '@types';

// Define interface for a TaskList object
interface TaskList {
  id: number;              // Unique identifier for the list
  title: string;           // Title of the task list
  description: string;     // Optional description of the list
  tasks_count?: number;    // Optional count of tasks in this list
}

// Define interface for component props
interface PageProps {
  lists: TaskList[];       // Array of task lists to display
  flash?: {                // Optional flash messages for success/error notifications
    success?: string;
    error?: string;
  };
}

// Define breadcrumb navigation items
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Lists',        // Display text for breadcrumb
    href: '/lists',        // URL path for breadcrumb
  },
];

// Main component function
export default function ListsIndex({ lists, flash }: PageProps) {
  // State for managing dialog visibility (create/edit modal)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // State for tracking which list is being edited (null for new lists)
  const [editingList, setEditingList] = useState<TaskList | null>(null);
  
  // State for toast notification (popup messages)
  const [toast, setToast] = useState({
    show: false,           // Whether toast is visible
    message: '',           // Toast message content
    type: 'success' as 'success' | 'error',  // Toast type (success or error)
  });

  // Initialize form handling with useForm hook from Inertia
  // This manages form data, submission, and state
  const listForm = useForm({
    title: '',            // Initial value for title field
    description: '',      // Initial value for description field
  });

  // Effect hook to handle flash messages from server
  // Runs when flash prop changes (after form submissions)
  useEffect(() => {
    if (flash?.success) {
      // Show success toast if success message exists
      showToast(flash.success, 'success');
    } else if (flash?.error) {
      // Show error toast if error message exists
      showToast(flash.error, 'error');
    }
  }, [flash]);  // Dependency array - effect runs when flash changes

  // Effect hook to auto-hide toast after 3 seconds
  // Runs when toast.show changes
  useEffect(() => {
    if (toast.show) {
      // Set timeout to hide toast after 3000ms (3 seconds)
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      
      // Cleanup function to clear timeout if component unmounts
      return () => clearTimeout(timer);
    }
  }, [toast.show]);  // Dependency array - effect runs when toast visibility changes

  // Helper function to show toast notifications
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  // Handler for form submission (both create and edit)
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();  // Prevent default form submission behavior
    
    if (editingList) {
      // If editing existing list, send PUT request to update
      listForm.put(`/lists/${editingList.id}`, {
        onSuccess: () => {
          // After successful update, close dialog and reset form
          closeDialogAndResetForm();
        },
      });
    } else {
      // If creating new list, send POST request to create
      listForm.post('/lists', {
        onSuccess: () => {
          // After successful creation, close dialog and reset form
          closeDialogAndResetForm();
        },
      });
    }
  };

  // Helper function to close dialog and reset form state
  const closeDialogAndResetForm = () => {
    setIsDialogOpen(false);    // Close the dialog/modal
    listForm.reset();          // Reset form fields to initial values
    setEditingList(null);      // Clear editing state
  };

  // Handler for clicking edit button on a list card
  const handleEditList = (list: TaskList) => {
    setEditingList(list);  // Set the list being edited
    // Pre-populate form with existing list data
    listForm.setData({
      title: list.title,
      description: list.description || '',  // Handle null description
    });
    setIsDialogOpen(true);  // Open the dialog
  };

  // Handler for clicking delete button on a list card
  const handleDeleteList = (listId: number) => {
    // Show confirmation dialog before deleting
    if (confirm('Are you sure you want to delete this list?')) {
      // Send DELETE request to remove the list
      listForm.delete(`/lists/${listId}`);
    }
  };

  // Handler for dialog open/close state changes
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);  // Update dialog visibility state
    if (!open) {
      // If dialog is closing, reset the form
      closeDialogAndResetForm();
    }
  };

  // Main component render
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {/* Set page title in head */}
      <Head title="Task Lists" />
      
      {/* Main content container */}
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Toast Notification Component */}
        {toast.show && (
          <ToastNotification 
            message={toast.message} 
            type={toast.type} 
          />
        )}
        
        {/* Page Header with Create Button */}
        <PageHeader 
          onAddList={() => setIsDialogOpen(true)}
        />
        
        {/* Create/Edit List Dialog (Modal) */}
        <ListDialog
          isOpen={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          isEditing={!!editingList}  // Convert to boolean: true if editing, false if creating
          formData={listForm.data}
          onFormChange={listForm.setData}
          onSubmit={handleFormSubmit}
          isProcessing={listForm.processing}  // Show loading state during form submission
        />
        
        {/* Grid display of task lists */}
        <ListsGrid
          lists={lists}
          onEditList={handleEditList}
          onDeleteList={handleDeleteList}
        />
      </div>
    </AppLayout>
  );
}

// Toast Notification Component - shows temporary success/error messages
function ToastNotification({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'  // Green for success, red for error
    } text-white animate-in fade-in slide-in-from-top-5`}>
      {/* Success or error icon */}
      {type === 'success' ? (
        <CheckCircle2 className="h-5 w-5" />
      ) : (
        <XCircle className="h-5 w-5" />
      )}
      {/* Toast message */}
      <span>{message}</span>
    </div>
  );
}

// Page Header Component - contains title and add button
function PageHeader({ onAddList }: { onAddList: () => void }) {
  return (
    <div className="flex justify-between items-center">
      {/* Page title */}
      <h1 className="text-2xl font-bold">Your Task Lists</h1>
      {/* Button to open create new list dialog */}
      <Button onClick={onAddList}>
        <Plus className="h-4 w-4 mr-2" />
        New List
      </Button>
    </div>
  );
}

// Props interface for ListDialog component
interface ListDialogProps {
  isOpen: boolean;                         // Whether dialog is open
  onOpenChange: (open: boolean) => void;   // Callback for open/state changes
  isEditing: boolean;                      // Whether editing existing list
  formData: { title: string; description: string };  // Current form data
  onFormChange: (field: string, value: string) => void;  // Callback for form changes
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;  // Form submission handler
  isProcessing: boolean;                   // Whether form is submitting
}

// List Dialog Component - modal for creating/editing lists
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
          {/* Dynamic title based on edit/create mode */}
          <DialogTitle>
            {isEditing ? 'Edit Task List' : 'Create New Task List'}
          </DialogTitle>
        </DialogHeader>
        
        {/* Form for list data */}
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            {/* Title input field */}
            <div className="space-y-2">
              <Label htmlFor="title">List Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => onFormChange('title', e.target.value)}
                placeholder="Enter list title"
                required  // Title is required field
              />
            </div>
            
            {/* Description textarea field */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onFormChange('description', e.target.value)}
                placeholder="Describe your list (optional)"
                rows={3}  // Default height for textarea
              />
            </div>
            
            {/* Submit button with dynamic text based on mode */}
            <Button 
              type="submit" 
              disabled={isProcessing}  // Disable during submission
              className="w-full"       // Full width button
            >
              {/* Show processing text or action text */}
              {isProcessing ? 'Processing...' : (isEditing ? 'Update List' : 'Create List')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Props interface for ListsGrid component
interface ListsGridProps {
  lists: TaskList[];                     // Array of lists to display
  onEditList: (list: TaskList) => void;  // Callback for edit action
  onDeleteList: (listId: number) => void;// Callback for delete action
}

// Lists Grid Component - displays all lists in a grid layout
function ListsGrid({ lists, onEditList, onDeleteList }: ListsGridProps) {
  // Show empty state message if no lists exist
  if (lists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No lists yet. Create your first one!</p>
      </div>
    );
  }

  // Render grid of list cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Map through lists array and render each as a card */}
      {lists.map((list) => (
        <ListCard 
          key={list.id}      // Unique key for React rendering
          list={list}        // List data to display
          onEdit={onEditList} // Edit handler
          onDelete={onDeleteList} // Delete handler
        />
      ))}
    </div>
  );
}

// List Card Component - individual card for each task list
function ListCard({ 
  list, 
  onEdit, 
  onDelete 
}: { 
  list: TaskList;                   // List data to display
  onEdit: (list: TaskList) => void; // Edit button handler
  onDelete: (listId: number) => void; // Delete button handler
}) {
  return (
    <Card className="hover:bg-accent/50 transition-colors">
      {/* Card header with title and action buttons */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {/* List title with line clamping to prevent overflow */}
        <CardTitle className="text-lg font-medium line-clamp-1">
          {list.title}
        </CardTitle>
        {/* Action buttons container */}
        <div className="flex gap-2">
          {/* Edit button */}
          <Button
            variant="ghost"    // Subtle styling
            size="icon"        // Icon-only button
            onClick={() => onEdit(list)}
            title="Edit list"  // Accessibility tooltip
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {/* Delete button with destructive styling */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(list.id)}
            className="text-destructive hover:text-destructive/90"
            title="Delete list"
            >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {/* Card content with description and task count */}
      <CardContent>
        {/* List description with line clamping */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {list.description || 'No description provided'}
        </p>
        
        {/* Display task count if available */}
        {list.tasks_count !== undefined && (
          <p className="text-sm text-muted-foreground mt-2">
            {/* Pluralize "task" based on count */}
            {list.tasks_count} task{list.tasks_count !== 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}