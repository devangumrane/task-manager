import { jest } from '@jest/globals';

// Define the mock factory
const mockTagsService = {
    createTag: jest.fn(),
    listTags: jest.fn(),
    attachTag: jest.fn(),
    detachTag: jest.fn(),
};

// Mock the module before importing it (ESM style)
jest.unstable_mockModule('../tags.service.js', () => ({
    tagsService: mockTagsService
}));

// Dynamic import after mocking
const { tagsController } = await import('../tags.controller.js');
const { tagsService } = await import('../tags.service.js');

describe('Tags Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            user: { id: 1 }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a tag successfully', async () => {
            req.params.workspaceId = '1';
            req.body = { name: 'Urgent', color: '#FF0000' };
            const mockTag = { id: 1, name: 'Urgent', color: '#FF0000', workspace_id: 1 };

            mockTagsService.createTag.mockResolvedValue(mockTag);

            await tagsController.create(req, res, next);

            expect(mockTagsService.createTag).toHaveBeenCalledWith(1, 1, { name: 'Urgent', color: '#FF0000' });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockTag });
        });
    });

    describe('list', () => {
        it('should list tags successfully', async () => {
            req.params.workspaceId = '1';
            const mockTags = [{ id: 1, name: 'Urgent' }];

            mockTagsService.listTags.mockResolvedValue(mockTags);

            await tagsController.list(req, res, next);

            expect(mockTagsService.listTags).toHaveBeenCalledWith(1, 1);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockTags });
        });
    });

    describe('attach', () => {
        it('should attach a tag to a task', async () => {
            req.params.taskId = '10';
            req.body = { tagId: 5 };

            mockTagsService.attachTag.mockResolvedValue();

            await tagsController.attach(req, res, next);

            expect(mockTagsService.attachTag).toHaveBeenCalledWith(1, 10, 5);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Tag attached' });
        });
    });

    describe('detach', () => {
        it('should detach a tag from a task', async () => {
            req.params.taskId = '10';
            req.params.tagId = '5';

            mockTagsService.detachTag.mockResolvedValue();

            await tagsController.detach(req, res, next);

            expect(mockTagsService.detachTag).toHaveBeenCalledWith(1, 10, 5);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Tag detached' });
        });
    });
});
