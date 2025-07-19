type Form = {
    id: string;
    title: string;
    status: string;
    lastModified: string;
};

type FieldSchema = {
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    min?: number;
    max?: number;
    maxLength?: number;
};

type User = {
    id: number;
    username: string;
    password: string;
    role: "admin" | "user";
    level?: string;
};

type Submission = {
    id: string;
    formTitle: string;
    submittedAt: string;
    status: string;
};

// ---------- INITIAL DATA ----------
// const initialForms: Form[] = [ /* ... فرم‌هایی که قبلاً دادی ... */];
const initialForms: Form[] = [
    {id: "1", title: "Customer Feedback", status: "Active", lastModified: "2024-03-15"},
    {id: "2", title: "Employee Survey", status: "Inactive", lastModified: "2024-03-10"},
];


// const initialFormSchemas: Record<string, FieldSchema[]> = { /* ... schemaها ... */};
const initialGroups = [ /* ... گروه‌ها ... */];
const initialFormPermissions = { /* ... permissionها ... */};

let forms: Form[] = JSON.parse(localStorage.getItem("forms") || JSON.stringify(initialForms));
if (!localStorage.getItem("forms")) localStorage.setItem("forms", JSON.stringify(initialForms));

const initialFormSchemas: Record<string, FieldSchema[]> = {
    "1": [
        {id: "fullName", label: "Full Name", type: "text", required: true, maxLength: 10},
        {id: "email", label: "Email Address", type: "text", required: true},
        {id: "age", label: "Age", type: "number", required: false, min: 18, max: 100},
        {id: "feedback", label: "Feedback", type: "textarea", required: true},
        {id: "visitDate", label: "Date of Visit", type: "date", required: true},
        {
            id: "rating",
            label: "Service Rating",
            type: "radio",
            required: true,
            options: ["Excellent", "Good", "Fair", "Poor"]
        },
        {
            id: "servicesUsed",
            label: "Services Used",
            type: "checkbox",
            required: false,
            options: ["Delivery", "Pickup", "In-store"]
        },
        {
            id: "recommendation",
            label: "Would you recommend us?",
            type: "dropdown",
            required: true,
            options: ["Yes", "No", "Maybe"]
        },
    ],
    "2": [
        {id: "employeeId", label: "Employee ID", type: "text", required: true},
        {
            id: "department",
            label: "Department",
            type: "dropdown",
            required: true,
            options: ["HR", "IT", "Finance", "Marketing"]
        },
        {
            id: "satisfaction",
            label: "Job Satisfaction",
            type: "radio",
            required: true,
            options: ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied"]
        },
        {id: "comments", label: "Additional Comments", type: "textarea", required: false},
    ],
};


let formSchemas: Record<string, FieldSchema[]> = JSON.parse(localStorage.getItem("formSchemas") || JSON.stringify(initialFormSchemas));
if (!localStorage.getItem("formSchemas")) localStorage.setItem("formSchemas", JSON.stringify(initialFormSchemas));

let users: User[] = [
    {id: 1, username: "admin@g.com", password: "adminadmin", role: "admin"},
    {id: 2, username: "user@g.com", password: "useruser", role: "user"},
    {id: 3, username: "p@g.com", password: "111111", role: "user"},
];

const userFormPermissions: Record<number, string[]> = {
    1: ["1", "2", "3", "4", "5", "6", "7"],
    2: ["1", "3", "5"],
    3: ["2", "4", "6", "7"],
};


let groups = JSON.parse(localStorage.getItem("groups") || JSON.stringify(initialGroups));
if (!localStorage.getItem("groups")) localStorage.setItem("groups", JSON.stringify(initialGroups));

let formPermissions = JSON.parse(localStorage.getItem("formPermissions") || JSON.stringify(initialFormPermissions));
if (!localStorage.getItem("formPermissions")) localStorage.setItem("formPermissions", JSON.stringify(initialFormPermissions));

let submissionsStore: Record<number, Submission[]> = {};

// ---------- EXPORT API ----------
export const mockApi = {
    getForms: async () => Promise.resolve(forms),

    getForm: async (id: string) => Promise.resolve(forms.find(f => f.id === id)),

    getFormById: async (formId: string) => Promise.resolve(formSchemas[formId] || []),

    deleteForm: async (formId: string) => {
        const formExists = forms.some(f => f.id === formId);
        if (!formExists) return Promise.reject("Form not found");
        forms = forms.filter(f => f.id !== formId);
        delete formSchemas[formId];
        localStorage.setItem("forms", JSON.stringify(forms));
        localStorage.setItem("formSchemas", JSON.stringify(formSchemas));
        return Promise.resolve();
    },

    submitForm: async (formId: string, values: any) => {
        const userId = Number(localStorage.getItem("userId"));
        const submission: Submission = {
            id: `${Date.now()}`,
            formTitle: `Form ${formId}`,
            submittedAt: new Date().toISOString(),
            status: "Active",
        };
        if (!submissionsStore[userId]) submissionsStore[userId] = [];
        submissionsStore[userId].push(submission);
        return Promise.resolve();
    },

    getFormSubmissions: async (formId: string) => {
        return Promise.resolve([
            {id: "sub1", submitterName: "John Doe", submittedAt: "2024-05-20"},
            {id: "sub2", submitterName: "Jane Smith", submittedAt: "2024-05-21"},
        ]);
    },

    getMySubmissions: async (userId: number) => {
        return Promise.resolve(submissionsStore[userId] || []);
    },

    deleteMySubmission: async (submissionId: string) => {
        const userId = Number(localStorage.getItem("userId"));
        submissionsStore[userId] = (submissionsStore[userId] || []).filter(
            s => s.id !== submissionId
        );
        return Promise.resolve();
    },

    register: async (username: string, password: string, level?: string) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (users.find(u => u.username === username)) reject(new Error("User exists"));
                else {
                    const newUser: User = {
                        id: users.length + 1,
                        username,
                        password,
                        role: "user",
                        level,
                    };
                    users.push(newUser);
                    resolve({...newUser, token: "mock-token"});
                }
            }, 2000);
        });
    },

    getUserAllowedForms: async (userId: number) => {
        const currentForms = JSON.parse(localStorage.getItem("forms") || JSON.stringify(initialForms));
        const user = users.find(u => u.id === userId);
        if (user?.role === "admin") return Promise.resolve(currentForms);
        const allowedFormIds = userFormPermissions[userId] || [];
        const allowedForms = currentForms.filter((form: Form) => allowedFormIds.includes(form.id));
        return Promise.resolve(allowedForms);
    },

    // getUserAllowedForms: async (userId: number) => {
    //     return [
    //         { id: '1', title: 'Feedback Form', status: 'Active' },
    //         { id: '2', title: 'Survey Form', status: 'Active' },
    //         { id: '3', title: 'Registration Form', status: 'Inactive' },
    //     ];
    // },

    // --- Profile ---
    getProfile: async () => ({
        name: 'fatemeh',
        email: 'Fati@gmail.com',
    }),

    updateProfile: async (data: { name: string }) => {
        console.log("Updating profile:", data);
        return Promise.resolve();
    },

    deleteAccount: async () => {
        console.log("Deleting account");
        return Promise.resolve();
    },

    // --- Groups & Permissions ---
    getGroups: async () => Promise.resolve(groups),

    getFormPermissions: async (formId: string) => Promise.resolve(formPermissions[formId] || []),

    updateFormPermissions: async (
        formId: string,
        permissions: Array<{ groupId: string; permission: "none" | "view" | "submit"; grantedAt?: string }>
    ) => {
        const existingPermissions = formPermissions[formId] || [];
        let hasChanges = false;

        formPermissions[formId] = permissions.map(newPerm => {
            const existing = existingPermissions.find(p => p.groupId === newPerm.groupId);
            if (existing && existing.permission === newPerm.permission) return existing;
            hasChanges = true;
            return {...newPerm, grantedAt: newPerm.grantedAt || new Date().toISOString()};
        });

        if (hasChanges) {
            const currentTime = new Date().toISOString();
            const formIndex = forms.findIndex(f => f.id === formId);
            if (formIndex !== -1) {
                forms[formIndex] = {...forms[formIndex], lastModified: currentTime};
                localStorage.setItem("forms", JSON.stringify(forms));
            }
        }

        localStorage.setItem("formPermissions", JSON.stringify(formPermissions));
        return Promise.resolve({success: true});
    },

    createGroup: async (groupData: { name: string; description: string; members: string[] }) => {
        const newGroup = {
            id: Math.random().toString(36).substr(2, 9),
            name: groupData.name,
            description: groupData.description,
            memberCount: groupData.members.length,
            createdAt: new Date().toISOString().split("T")[0],
        };
        groups = [...groups, newGroup];
        localStorage.setItem("groups", JSON.stringify(groups));
        return newGroup;
    },

    deleteGroup: async (groupId: string) => {
        groups = groups.filter(g => g.id !== groupId);
        localStorage.setItem("groups", JSON.stringify(groups));
    },

    searchUsers: async (query: string) => {
        return users
            .filter(u => u.username.toLowerCase().includes(query.toLowerCase()))
            .map(u => ({id: u.id.toString(), name: u.username}));
    },

    getUser: async (userId: string) => {
        const user = users.find(u => u.id.toString() === userId);
        if (!user) throw new Error("User not found");
        return {id: user.id.toString(), name: user.username};
    },
};
  