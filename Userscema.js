const schema = {
   type: 'object',
   properties: {
     name: { type: 'string', minLength: 2 },
     lastname: { type: 'string', minLength: 2 },
     email: { type: 'string', format: 'email' },
     phone: { type: 'string' },
     text: { type: 'string', minLength: 10 }
   },
   required: ['name', 'email', 'text']
 };