const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Dynamically generate a secret key on startup
const secretKey = require('crypto').randomBytes(32).toString('hex');

// In-memory storage
const users = [];
let forms = [];
let submissions = [];
let groups = [];
const tokenMap = new Map(); // { token: { user: { name, email }, expiresAt } }

// Add test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};
users.push(testUser);

// Initialize test form with numerical fields
const testForm = {
  id: 'test-form-1',
  title: 'Sales Performance Report',
  fields: [
    {
      id: 'sales-amount',
      type: 'number',
      label: 'Sales Amount ($)',
      required: true,
      defaultValue: 0
    },
    {
      id: 'customer-count',
      type: 'number',
      label: 'Number of Customers',
      required: true,
      defaultValue: 0
    },
    {
      id: 'average-rating',
      type: 'number',
      label: 'Customer Satisfaction (1-5)',
      required: true,
      defaultValue: 0
    },
    {
      id: 'conversion-rate',
      type: 'number',
      label: 'Conversion Rate (%)',
      required: true,
      defaultValue: 0
    },
    {
      id: 'average-order-value',
      type: 'number',
      label: 'Average Order Value ($)',
      required: true,
      defaultValue: 0
    }
  ],
  status: 'Active',
  createdBy: 'test@example.com',
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  permissions: [
    {
      groupId: 'test-group-1',
      canView: true,
      canSubmit: true,
      grantedAt: new Date().toISOString()
    }
  ]
};

// Clear any existing forms and add the test form
forms = [testForm];

// Initialize test group
const testGroup = {
  id: 'test-group-1',
  name: 'Test Group',
  members: ['test@example.com'],
  createdBy: 'test@example.com',
  createdAt: new Date().toISOString()
};

// Clear any existing groups and add the test group
groups = [testGroup];

// Initialize test submissions with more comprehensive data
const testSubmissions = [
  {
    id: 'sub-1',
    formId: 'test-form-1',
    userEmail: 'test@example.com',
    data: {
      'sales-amount': 1500,
      'customer-count': 25,
      'average-rating': 4.5,
      'conversion-rate': 3.2,
      'average-order-value': 60
    },
    submittedAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'sub-2',
    formId: 'test-form-1',
    userEmail: 'test@example.com',
    data: {
      'sales-amount': 2000,
      'customer-count': 30,
      'average-rating': 4.8,
      'conversion-rate': 3.5,
      'average-order-value': 66.67
    },
    submittedAt: new Date('2024-01-02').toISOString()
  },
  {
    id: 'sub-3',
    formId: 'test-form-1',
    userEmail: 'test@example.com',
    data: {
      'sales-amount': 1800,
      'customer-count': 28,
      'average-rating': 4.2,
      'conversion-rate': 3.3,
      'average-order-value': 64.29
    },
    submittedAt: new Date('2024-01-03').toISOString()
  },
  {
    id: 'sub-4',
    formId: 'test-form-1',
    userEmail: 'test@example.com',
    data: {
      'sales-amount': 2200,
      'customer-count': 35,
      'average-rating': 4.7,
      'conversion-rate': 3.6,
      'average-order-value': 62.86
    },
    submittedAt: new Date('2024-01-04').toISOString()
  },
  {
    id: 'sub-5',
    formId: 'test-form-1',
    userEmail: 'test@example.com',
    data: {
      'sales-amount': 1900,
      'customer-count': 32,
      'average-rating': 4.4,
      'conversion-rate': 3.4,
      'average-order-value': 59.38
    },
    submittedAt: new Date('2024-01-05').toISOString()
  }
];

// Clear any existing submissions and add the test submissions
submissions = [...testSubmissions];

// Clean up expired tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, { expiresAt }] of tokenMap.entries()) {
    if (expiresAt < now) {
      tokenMap.delete(token);
    }
  }
}, 10 * 60 * 1000);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

app.get('/api/', authenticateToken, (req, res) => {
  console.log('Fetching dashboard data for:', req.user.email);
  const userEmail = req.user.email;
  const user = users.find(u => u.email === userEmail);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const userForms = forms.filter(form => form.createdBy === userEmail);
  const formIds = userForms.map(form => form.id);
  const userSubmissions = submissions.filter(sub => formIds.includes(sub.formId));
  const userGroups = groups.filter(group => group.members.includes(userEmail));

  const dashboardData = {
    user: { name: user.name, email: user.email },
    stats: {
      totalForms: userForms.length,
      totalSubmissions: userSubmissions.length,
      totalGroups: userGroups.length,
    },
  };

  res.json(dashboardData);
});

app.post('/api/register', (req, res) => {
  console.log('Register attempt:', req.body);
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    console.log('Registration failed: Missing fields');
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  if (users.some(user => user.email === email)) {
    console.log('Registration failed: Email already registered');
    return res.status(409).json({ message: 'Email already registered' });
  }
  users.push({ name, email, password });
  console.log('Registered users:', users);
  res.status(200).json({ message: 'Registration successful', userName: name });
});

app.post('/api/login', (req, res) => {
  console.log('Login attempt:', req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    console.log('Login failed: Missing email or password');
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  console.log('Checking user:', email);
  console.log('Available users:', users);
  const user = users.find(u => u.email === email && u.password === password);
  console.log('User found:', user);
  
  if (!user) {
    console.log('Login failed: Invalid credentials');
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  try {
    // Check for existing valid token
    let existingToken = null;
    for (const [token, { user: tokenUser, expiresAt }] of tokenMap.entries()) {
      if (tokenUser.email === email && expiresAt > Date.now()) {
        existingToken = token;
        break;
      }
    }

    if (existingToken) {
      console.log('Returning existing token for:', email);
      return res.status(200).json({
        message: 'Login successful',
        userName: user.name,
        token: existingToken,
      });
    }

    // Generate new token
    const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
    tokenMap.set(token, {
      user: { name: user.name, email: user.email },
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
    });
    console.log('Generated new token for:', email);
    res.status(200).json({
      message: 'Login successful',
      userName: user.name,
      token,
    });
  } catch (error) {
    console.error('Token generation failed:', error.message);
    res.status(500).json({ message: 'Failed to generate token' });
  }
});

app.post('/api/auth/validate', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Validating token:', token);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  const tokenData = tokenMap.get(token);
  if (tokenData && tokenData.expiresAt > Date.now()) {
    console.log('Token is valid for:', tokenData.user.email);
    return res.status(200).json({ message: 'Token is valid' });
  }

  // Token is invalid or expired, try to issue a new one
  try {
    const decoded = jwt.verify(token, secretKey, { ignoreExpiration: true });
    const user = users.find(u => u.email === decoded.email);
    if (!user) {
      console.log('User not found for expired token:', decoded.email);
      tokenMap.delete(token);
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new token
    const newToken = jwt.sign({ email: user.email }, secretKey, { expiresIn: '1h' });
    tokenMap.set(newToken, {
      user: { name: user.name, email: user.email },
      expiresAt: Date.now() + 60 * 60 * 1000,
    });
    tokenMap.delete(token);
    console.log('Issued new token for:', user.email);
    res.status(200).json({ message: 'Token refreshed', token: newToken });
  } catch (err) {
    console.log('Invalid token:', err.message);
    tokenMap.delete(token);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/api/forms', authenticateToken, (req, res) => {
  console.log('Fetching forms for:', req.user.email);
  const userEmail = req.user.email;
  res.json(forms.filter(form => form.createdBy === userEmail));
});

app.get('/api/forms/:id', authenticateToken, (req, res) => {
  console.log(`Fetching form ${req.params.id} for:`, req.user.email);
  const form = forms.find(f => f.id === req.params.id && f.createdBy === req.user.email);
  if (form) {
    res.json(form);
  } else {
    res.status(404).json({ message: 'Form not found or unauthorized' });
  }
});

app.post('/api/forms', authenticateToken, (req, res) => {
  console.log('Creating form for:', req.user.email, req.body);
  const form = {
    id: uuidv4(),
    title: req.body.title,
    fields: req.body.fields,
    status: req.body.status || 'Active',
    createdBy: req.user.email,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };
  forms.push(form);
  res.status(201).json(form);
});

app.put('/api/forms/:id', authenticateToken, (req, res) => {
  console.log(`Updating form ${req.params.id} for:`, req.user.email, req.body);
  const index = forms.findIndex(f => f.id === req.params.id && f.createdBy === req.user.email);
  if (index !== -1) {
    forms[index] = {
      ...forms[index],
      title: req.body.title,
      fields: req.body.fields,
      status: req.body.status || forms[index].status,
      lastModified: new Date().toISOString(),
    };
    res.json(forms[index]);
  } else {
    res.status(404).json({ message: 'Form not found or unauthorized' });
  }
});

app.delete('/api/forms/:id', authenticateToken, (req, res) => {
  console.log(`Deleting form ${req.params.id} for:`, req.user.email);
  const index = forms.findIndex(f => f.id === req.params.id && f.createdBy === req.user.email);
  if (index !== -1) {
    forms.splice(index, 1);
    submissions = submissions.filter(sub => sub.formId !== req.params.id);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Form not found or unauthorized' });
  }
});

app.post('/api/forms/:id/submissions', authenticateToken, (req, res) => {
  console.log(`Submitting form ${req.params.id} for:`, req.user.email, req.body);
  const form = forms.find(f => f.id === req.params.id);
  if (!form) {
    return res.status(404).json({ message: 'Form not found' });
  }
  const submission = {
    id: uuidv4(),
    formId: req.params.id,
    userEmail: req.user.email,
    data: req.body,
    submittedAt: new Date().toISOString(),
  };
  submissions.push(submission);
  res.status(201).json({ message: 'Submission successful', submission });
});

app.get('/api/forms/:id/submissions', authenticateToken, (req, res) => {
  console.log(`Fetching submissions for form ${req.params.id} for:`, req.user.email);
  const form = forms.find(f => f.id === req.params.id && f.createdBy === req.user.email);
  if (!form) {
    return res.status(404).json({ message: 'Form not found or unauthorized' });
  }
  const formSubmissions = submissions.filter(sub => sub.formId === req.params.id);
  res.json(formSubmissions);
});

app.get('/api/groups', authenticateToken, (req, res) => {
  console.log('Fetching groups for:', req.user.email);
  const userGroups = groups.filter(group => group.members.includes(req.user.email));
  console.log('Groups found for user:', userGroups);
  res.json(userGroups);
});

app.post('/api/groups', authenticateToken, (req, res) => {
  console.log('Creating group for:', req.user.email, req.body);
  const group = {
    id: uuidv4(),
    name: req.body.name,
    members: [req.user.email, ...(req.body.members || [])],
    createdBy: req.user.email,
    createdAt: new Date().toISOString(),
  };
  groups.push(group);
  res.status(201).json(group);
});

app.delete('/api/groups/:id', authenticateToken, (req, res) => {
  console.log(`Deleting group ${req.params.id} for:`, req.user.email);
  const index = groups.findIndex(g => g.id === req.params.id && g.createdBy === req.user.email);
  if (index !== -1) {
    groups.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Group not found or unauthorized' });
  }
});

app.delete('/api/users/:email', authenticateToken, (req, res) => {
  console.log(`Deleting user ${req.params.email}`);
  if (req.user.email !== req.params.email) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  users.splice(users.findIndex(u => u.email === req.params.email), 1);
  forms = forms.filter(form => form.createdBy !== req.params.email);
  submissions = submissions.filter(sub => sub.userEmail !== req.params.email);
  groups = groups.filter(group => group.createdBy !== req.params.email);
  groups.forEach(group => {
    group.members = group.members.filter(member => member !== req.params.email);
  });
  // Remove all tokens for this user
  for (const [token, { user }] of tokenMap.entries()) {
    if (user.email === req.params.email) {
      tokenMap.delete(token);
    }
  }
  res.status(204).send();
});

// Get numerical fields for a form
app.get('/api/forms/:id/numerical-fields', authenticateToken, (req, res) => {
  console.log(`Fetching numerical fields for form ${req.params.id} for:`, req.user.email);
  const form = forms.find(f => f.id === req.params.id && f.createdBy === req.user.email);
  console.log('Found form:', form);
  
  if (!form) {
    console.log('Form not found or unauthorized');
    return res.status(404).json({ message: 'Form not found or unauthorized' });
  }

  console.log('Form fields:', form.fields);
  const numericalFields = form.fields.filter(field => {
    const isNumerical = field.type === 'number' || 
      (field.type === 'text' && !isNaN(Number(field.defaultValue)));
    console.log(`Field ${field.label} (${field.type}) is numerical:`, isNumerical);
    return isNumerical;
  }).map(field => ({
    id: field.id,
    label: field.label,
    type: field.type
  }));

  console.log('Numerical fields found:', numericalFields);
  res.json(numericalFields);
});

// Generate aggregated report
app.post('/api/forms/:id/reports/aggregate', authenticateToken, (req, res) => {
  console.log(`Generating aggregate report for form ${req.params.id} for:`, req.user.email);
  const { fieldId, aggregation } = req.body;
  
  const form = forms.find(f => f.id === req.params.id && f.createdBy === req.user.email);
  if (!form) {
    return res.status(404).json({ message: 'Form not found or unauthorized' });
  }

  const field = form.fields.find(f => f.id === fieldId);
  if (!field) {
    return res.status(404).json({ message: 'Field not found' });
  }

  const formSubmissions = submissions.filter(sub => sub.formId === req.params.id);
  if (formSubmissions.length === 0) {
    return res.json({ 
      result: 0,
      totalSubmissions: 0,
      aggregation,
      fieldLabel: field.label
    });
  }

  let result;
  const values = formSubmissions.map(sub => {
    const value = sub.data[fieldId];
    return field.type === 'number' ? Number(value) : Number(value) || 0;
  }).filter(v => !isNaN(v));

  switch (aggregation) {
    case 'count':
      result = values.length;
      break;
    case 'sum':
      result = values.reduce((a, b) => a + b, 0);
      break;
    case 'average':
      result = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      break;
    default:
      return res.status(400).json({ message: 'Invalid aggregation type' });
  }

  res.json({
    result: Number(result.toFixed(2)),
    totalSubmissions: formSubmissions.length,
    aggregation,
    fieldLabel: field.label
  });
});

// Get form permissions
app.get('/api/forms/:id/permissions', authenticateToken, (req, res) => {
  console.log(`Fetching permissions for form ${req.params.id} for:`, req.user.email);
  const form = forms.find(f => f.id === req.params.id && f.createdBy === req.user.email);
  if (!form) {
    return res.status(404).json({ message: 'Form not found or unauthorized' });
  }

  // Get all groups the user has access to
  const userGroups = groups.filter(group => group.members.includes(req.user.email));
  
  // Get permissions for each group
  const permissions = userGroups.map(group => {
    const permission = form.permissions?.find(p => p.groupId === group.id) || {
      groupId: group.id,
      canView: false,
      canSubmit: false,
      grantedAt: new Date().toISOString()
    };

    return {
      ...permission,
      groupName: group.name
    };
  });

  res.json(permissions);
});

// Update form permissions
app.patch('/api/forms/:id/permissions', authenticateToken, (req, res) => {
  console.log(`Updating permissions for form ${req.params.id} for:`, req.user.email);
  const form = forms.find(f => f.id === req.params.id && f.createdBy === req.user.email);
  if (!form) {
    return res.status(404).json({ message: 'Form not found or unauthorized' });
  }

  const { permissions } = req.body;
  if (!Array.isArray(permissions)) {
    return res.status(400).json({ message: 'Invalid permissions data' });
  }

  // Validate that all groups exist and user has access to them
  const userGroups = groups.filter(group => group.members.includes(req.user.email));
  const validGroupIds = userGroups.map(g => g.id);
  
  const invalidPermissions = permissions.filter(p => !validGroupIds.includes(p.groupId));
  if (invalidPermissions.length > 0) {
    return res.status(400).json({ message: 'Invalid group permissions' });
  }

  // Update form permissions
  form.permissions = permissions.map(p => ({
    groupId: p.groupId,
    canView: p.canView,
    canSubmit: p.canSubmit,
    grantedAt: p.grantedAt
  }));

  res.json({ message: 'Permissions updated successfully' });
});

app.get('/api/profile', authenticateToken, (req, res) => {
  console.log('Fetching profile for:', req.user.email);
  const user = users.find(u => u.email === req.user.email);
  if (!user) {
    // This case should ideally not happen if authenticateToken works correctly
    return res.status(404).json({ message: 'User not found' });
  }
  // Only return necessary profile information
  res.json({ name: user.name, email: user.email });
});

app.put('/api/profile', authenticateToken, (req, res) => {
  console.log('Updating profile for:', req.user.email, req.body);
  const userEmail = req.user.email;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const userIndex = users.findIndex(u => u.email === userEmail);
  if (userIndex !== -1) {
    users[userIndex].name = name;
    console.log('Profile updated for:', userEmail, users[userIndex]);
    // Return the updated user profile
    res.json({ name: users[userIndex].name, email: users[userIndex].email });
  } else {
    // This case should ideally not happen if authenticateToken works correctly
    res.status(404).json({ message: 'User not found' });
  }
});

app.get('/api/user/forms', authenticateToken, (req, res) => {
  console.log('Fetching accessible forms for:', req.user.email);
  const userEmail = req.user.email;

  // Find all groups the user is a member of
  const userGroups = groups.filter(group => group.members.includes(userEmail));
  const userGroupIds = userGroups.map(group => group.id);

  // Filter forms based on permissions
  const accessibleForms = forms.filter(form => {
    // Check if the user created the form (they always have access)
    if (form.createdBy === userEmail) {
      return true;
    }

    // Check if the user has view or submit permissions through any of their groups
    if (form.permissions && form.permissions.length > 0) {
      return form.permissions.some(permission =>
        userGroupIds.includes(permission.groupId) && (permission.canView || permission.canSubmit)
      );
    }

    // If no specific permissions are set, assume no access by default (or implement a different default policy)
    return false;
  });

  console.log('Accessible forms found:', accessibleForms.map(f => f.title));
  res.json(accessibleForms);
});

app.get('/api/user/submissions', authenticateToken, (req, res) => {
  console.log('Fetching submissions for user:', req.user.email);
  const userEmail = req.user.email;

  const userSubmissions = submissions.filter(sub => sub.userEmail === userEmail);

  console.log('Submissions found for user:', userEmail, userSubmissions.length);
  res.json(userSubmissions);
});

app.delete('/api/submissions/:id', authenticateToken, (req, res) => {
  console.log('Deleting submission:', req.params.id, 'for user:', req.user.email);
  const submissionId = req.params.id;
  const userEmail = req.user.email;

  const submissionIndex = submissions.findIndex(sub => sub.id === submissionId);

  if (submissionIndex === -1) {
    return res.status(404).json({ message: 'Submission not found' });
  }

  // Optional: Add a check to ensure only the user who submitted or the form owner can delete
  // For now, allowing any authenticated user to delete a submission by ID
  // if (submissions[submissionIndex].userEmail !== userEmail && forms.find(f => f.id === submissions[submissionIndex].formId)?.createdBy !== userEmail) {
  //   return res.status(403).json({ message: 'Unauthorized to delete this submission' });
  // }

  submissions.splice(submissionIndex, 1);
  console.log('Submission deleted:', submissionId);
  res.status(204).send();
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Authenticating with token:', token);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  const tokenData = tokenMap.get(token);
  if (!tokenData || tokenData.expiresAt < Date.now()) {
    console.log('Invalid or expired token');
    tokenMap.delete(token);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.user = tokenData.user;
  console.log('Token validated for:', req.user.email);
  next();
}

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));