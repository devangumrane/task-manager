# Project Diagrams

## Visual Flow Diagram (User Navigation)

This diagram represents the user navigation flow within the frontend application.

```mermaid
graph TD
    User((User))
    
    subgraph Public
        Login[Login Page]
        Register[Register Page]
    end
    
    subgraph Protected [Protected Layout / AppShell]
        Dashboard[Dashboard]
        Profile[User Profile]
        
        subgraph WorkspaceScope [Workspace Scope]
            WS_Index[Workspaces List]
            WS_Details[Workspace Details]
            Projects_Index[Projects List]
            Project_Details[Project Details]
            Task_Details[Task Details]
            Activity[Activity Log]
        end
    end

    User --> |Start| Login
    User --> |Start| Register
    
    Login --> |Success| Dashboard
    Register --> |Success| Dashboard
    
    Dashboard --> |Nav| WS_Index
    Dashboard --> |Nav| Profile
    
    WS_Index --> |Select Workspace| WS_Details
    WS_Details --> |View Projects| Projects_Index
    WS_Details --> |View Activity| Activity
    
    Projects_Index --> |Select Project| Project_Details
    Project_Details --> |Select Task| Task_Details
    
    %% Lateral Navigation
    WS_Details -.-> |Direct Link| Project_Details
    Project_Details -.-> |Direct Link| Task_Details
```

## RBAC Flow Diagram (Backend Authorization)

This diagram details the logic flow in the `workspaceRoleGuard` middleware used for securing workspace routes.

```mermaid
flowchart TD
    Start([Request to Protected Route]) --> Authentication{Is User Authenticated?}
    
    Authentication -- No --> AuthFail[Return 401 Unauthenticated]
    Authentication -- Yes --> WorkspaceCheck{Does Workspace Exist?}
    
    WorkspaceCheck -- No --> WSFail[Return 404 Not Found]
    WorkspaceCheck -- Yes --> OwnerCheck{Is User == Workspace Owner?}
    
    OwnerCheck -- Yes --> GrantAdmin[Grant Role: ADMIN]
    GrantAdmin --> Approve[Next Middleware / Controller]
    
    OwnerCheck -- No --> MemberCheck{Is User Board Member?}
    
    MemberCheck -- No --> AccessDenied[Return 403 Not Member]
    MemberCheck -- Yes --> RoleRetrieval[Fetch User Role: Member/Admin]
    
    RoleRetrieval --> PrecedenceCheck{Is UserRole >= RequiredRole?}
    
    PrecedenceCheck -- No --> Forbidden[Return 403 Insufficient Role]
    
    %% Role Precedence Logic
    subgraph Precedence [Role Hierarchy]
        direction BT
        MemberRole[Member]
        AdminRole[Admin]
        
        MemberRole -->|Lower| AdminRole
    end
    
    PrecedenceCheck -- Yes --> Approve
    
    style AuthFail fill:#f9f,stroke:#333,stroke-width:2px
    style WSFail fill:#f9f,stroke:#333,stroke-width:2px
    style AccessDenied fill:#f9f,stroke:#333,stroke-width:2px
    style Forbidden fill:#f9f,stroke:#333,stroke-width:2px
    style Approve fill:#9f9,stroke:#333,stroke-width:2px
```
