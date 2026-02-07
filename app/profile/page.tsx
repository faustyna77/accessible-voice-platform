import ProtectedRoute from '@/components/ProtectedRoute';
import ProfileForm from '@/components/ProfileForm';
import ReportGenerator from '@/components/ReportGenerator';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto">
          <ReportGenerator assistantResponses={[]} />
        </div>
      </div>
    </ProtectedRoute>
  );
}