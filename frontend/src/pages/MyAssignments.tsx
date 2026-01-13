import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MyAssignments as MyAssignmentsList } from '../components/assignments/MyAssignments';
import { AssignmentDetail } from '../components/assignments/AssignmentDetail';
import { TaskCreationWizard } from '../components/assignments/TaskCreationWizard';
import { TaskEditWizard } from '../components/assignments/TaskEditWizard';

export function MyAssignments() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine view from URL path
  const getView = () => {
    const path = location.pathname;
    
    // /my-assignments
    if (path === '/my-assignments') {
      return 'list';
    }
    
    // /my-assignments/:id/create-task
    if (path.includes('/create-task')) {
      return 'create-task';
    }
    
    // /my-assignments/:id/tasks/:taskId
    if (path.includes('/tasks/')) {
      return 'edit-task';
    }
    
    // /my-assignments/:id (assignment detail)
    if (params.assignmentId) {
      return 'detail';
    }
    
    return 'list';
  };

  const view = getView();
  const assignmentId = params.assignmentId || params['*']?.split('/')[0];
  const taskId = params.taskId;

  // Render based on view
  switch (view) {
    case 'detail':
      return <AssignmentDetail assignmentId={assignmentId} />;
    
    case 'create-task':
      return <TaskCreationWizard assignmentId={assignmentId} />;
    
    case 'edit-task':
      return (
        <TaskEditWizard
          assignmentId={assignmentId}
          taskId={taskId}
        />
      );
    
    case 'list':
    default:
      return <MyAssignmentsList />;
  }
}