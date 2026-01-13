import { WorkflowGuide as WorkflowGuideComponent } from '../components/workflow/WorkflowGuide';
import { useAuthStore } from '../store/authStore';

export default function WorkflowGuide() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400">Please log in to view workflow guide</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-8">
      <WorkflowGuideComponent currentRole={user.role} />
    </div>
  );
}