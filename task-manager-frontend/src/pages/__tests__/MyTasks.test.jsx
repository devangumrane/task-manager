import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../utils/test-utils';
import MyTasks from '../MyTasks';
import * as taskService from '../../services/taskService';

// Mock taskService
vi.mock('../../services/taskService', () => ({
    getMyTasks: vi.fn()
}));

const mockTasks = [
    {
        id: 1,
        title: 'Test Task 1',
        priority: 'HIGH',
        status: 'in_progress',
        project: { id: 101, name: 'Project A', workspace: { id: 10, name: 'Workspace X' }, workspace_id: 10 },
        deadline: new Date(Date.now() + 86400000).toISOString()
    }
];

describe('MyTasks Component', () => {
    it('renders tasks when loaded', async () => {
        taskService.getMyTasks.mockResolvedValue(mockTasks);
        render(<MyTasks />);

        await waitFor(() => {
            expect(screen.getByText('Test Task 1')).toBeInTheDocument();
            expect(screen.getByText('Project A')).toBeInTheDocument();
            expect(screen.getByText('Workspace X')).toBeInTheDocument();
        });
    });

    it('renders empty state when no tasks', async () => {
        taskService.getMyTasks.mockResolvedValue([]);
        render(<MyTasks />);

        await waitFor(() => {
            expect(screen.getByText(/All caught up!/i)).toBeInTheDocument();
        });
    });
});
