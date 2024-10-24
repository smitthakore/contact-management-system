# Contact Management System (CMS)
[Demo video here](https://drive.google.com/file/d/18EJu4JDmOvbqbGNjM8iACxLxW7yia2Mg/view?usp=sharing)
## Overview
The web application follows strict MVC pattern.
This project is a Contact Management System (CMS) that allows users to create, view, edit, and delete contacts. It also includes several additional features such as exporting contacts, generating QR codes, and a user authentication system.

## Features
1. User Authentication
   - Users can register, login, and logout securely. Protected routes are available to manage contacts and other user-specific features.
2. Contact Management
   - Create, view, edit, and delete contacts. Each contact can store a name, phone number, and email address.
3. QR Code Generation
   - The system generates a unique QR code for each contact containing their details. This can be scanned to retrieve the contact's details quickly.
4. Import/Export Contacts
   - The system allows users to import/export their contacts to a VCF file. 
5. Search and Sort
   - Users can search for specific contacts and sort contacts by name or email. 
6. Favorites
   -  Users can mark contacts as favorites and view them separately. A feature that allows users to display selected contacts with checkboxes on the home page.
7. Responsive Design

```sh
# Run backend

git clone https://github.com/your-username/contact-management-system.git
cd contact-management-system/backend
yarn run dev
```
```sh
# Run frontend

cd contact-management-system/frontend
yarn start
```


