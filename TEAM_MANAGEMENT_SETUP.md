# Team Management Feature - Complete Setup Guide

## 🎉 Overview

Your team management feature is now fully implemented with:

✅ **Add Team Members** - Email, name, position, role  
✅ **Edit Team Members** - Update any member details  
✅ **Delete Team Members** - With confirmation modal  
✅ **Assign Tasks** - Bulk assign tasks to team members  
✅ **10 Positions** - CEO, CTO, Developer, Tester, DevOps, Operational, Manager, Designer, Sales, Marketing  
✅ **Role-Based Access** - Admin, Member, Viewer  
✅ **Status Tracking** - Active, Inactive, Invited  
✅ **Permissions System** - Auto-set based on role  

---

## 📦 Files Added

### Backend (4 files)
- `backend/src/models/teamMember.model.js` - MongoDB schema
- `backend/src/controllers/teamMember.controller.js` - Business logic
- `backend/src/routes/teamMember.routes.js` - API endpoints
- `backend/src/app.js` - Updated with team routes

### Frontend (3 files)
- `frontend/src/store/teamStore.js` - Zustand state management
- `frontend/src/components/TeamManagement.jsx` - Main team UI
- `frontend/src/components/TaskAssignment.jsx` - Task assignment modal

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/vivekpandey3/saas-project.git
cd saas-project
git checkout feat/team-management
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📍 API Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|-----------|
| GET | `/api/workspaces/:workspaceId/team-members` | List all members | Any user |
| GET | `/api/workspaces/:workspaceId/team-members/:memberId` | Get single member | Any user |
| POST | `/api/workspaces/:workspaceId/team-members` | Add new member | canManageTeam |
| PATCH | `/api/workspaces/:workspaceId/team-members/:memberId` | Update member | canManageTeam |
| DELETE | `/api/workspaces/:workspaceId/team-members/:memberId` | Delete member | canDeleteMembers |
| POST | `/api/workspaces/:workspaceId/team-members/:memberId/assign-task` | Assign task | canAssignTasks |
| POST | `/api/workspaces/:workspaceId/team-members/:memberId/unassign-task` | Unassign task | canAssignTasks |

---

## 🧑‍💼 Available Positions

- CEO
- CTO
- Developer
- Tester
- DevOps
- Operational
- Manager
- Designer
- Sales
- Marketing

---

## 👥 Roles & Permissions

### Admin Role
- ✅ Create tasks
- ✅ Delete tasks
- ✅ Assign tasks to members
- ✅ Manage team (add/edit/delete)
- ✅ Delete members

### Member Role
- ✅ Create tasks
- ❌ Delete tasks
- ❌ Assign tasks
- ❌ Manage team
- ❌ Delete members

### Viewer Role
- ❌ Create tasks
- ❌ Delete tasks
- ❌ Assign tasks
- ❌ Manage team
- ❌ Delete members

---

## 💻 Testing with cURL

### Add Team Member
```bash
curl -X POST http://localhost:5000/api/workspaces/[workspaceId]/team-members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [your_token]" \
  -d '{
    "email": "dev@example.com",
    "firstName": "John",
    "lastName": "Developer",
    "position": "Developer",
    "role": "member"
  }'
```

### Get All Team Members
```bash
curl -X GET http://localhost:5000/api/workspaces/[workspaceId]/team-members \
  -H "Authorization: Bearer [your_token]"
```

### Update Team Member
```bash
curl -X PATCH http://localhost:5000/api/workspaces/[workspaceId]/team-members/[memberId] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [your_token]" \
  -d '{
    "position": "Senior Developer",
    "role": "admin"
  }'
```

### Assign Task to Member
```bash
curl -X POST http://localhost:5000/api/workspaces/[workspaceId]/team-members/[memberId]/assign-task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [your_token]" \
  -d '{
    "taskId": "[taskId]"
  }'
```

### Delete Team Member
```bash
curl -X DELETE http://localhost:5000/api/workspaces/[workspaceId]/team-members/[memberId] \
  -H "Authorization: Bearer [your_token]"
```

---

## 🎨 Frontend Integration

### Add Route to Your Router
```jsx
import TeamManagement from './components/TeamManagement';

// In your router:
{
  path: '/workspace/:workspaceId/team',
  element: <TeamManagement />
}
```

### Use Task Assignment Component
```jsx
import TaskAssignment from './components/TaskAssignment';
import { useState } from 'react';

export default function TaskDetail({ taskId }) {
  const [showAssign, setShowAssign] = useState(false);

  return (
    <>
      <button onClick={() => setShowAssign(true)}>
        Assign to Team
      </button>
      {showAssign && (
        <TaskAssignment 
          taskId={taskId} 
          onClose={() => setShowAssign(false)} 
        />
      )}
    </>
  );
}
```

---

## ⚙️ Environment Configuration

### Backend `.env`
```env
MONGODB_URI=mongodb://localhost:27017/saas-project
PORT=5000
JWT_SECRET=your_secret_key_here
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🐛 Troubleshooting

### "Access denied" Error
- Verify you're logged in
- Check workspace ID is correct
- Confirm you have required permissions

### "Member already exists" Error
- Email is already in workspace
- Use different email or delete existing member

### "Task not found" Error
- Verify task ID is correct
- Ensure task belongs to same workspace

### Port Already in Use
- **Backend**: Change PORT in `.env`
- **Frontend**: Run `npm run dev -- --port 3000`

---

## 📝 Next Steps

1. ✅ Clone the repository
2. ✅ Install dependencies
3. ✅ Set environment variables
4. ✅ Run backend and frontend
5. ✅ Navigate to team management page
6. ✅ Add your first team member
7. ✅ Assign tasks to team members

---

## 💡 Usage Examples

### Adding Your First Team Member
1. Click "Add Member" button
2. Fill in email, name, position, and role
3. Click "Save"
4. Member appears in the list

### Editing a Member
1. Click the edit icon on a member card
2. Update the fields
3. Click "Save"
4. Changes are reflected immediately

### Assigning a Task
1. Open task assignment modal
2. Select team members
3. Click "Assign Task"
4. Task is assigned to all selected members

### Deleting a Member
1. Click trash icon on member card
2. Confirm deletion
3. Member is removed from team

---

## 🤝 Support

For issues or questions:
1. Check console for error messages
2. Review API response in Network tab
3. Verify all environment variables are set
4. Check backend/frontend are running

Happy coding! 🚀
