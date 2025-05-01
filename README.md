## Chat Application

An interactive, real-time chat application built with **Node.js**, **Express**, **Socket.io**, and **MySQL**.

---

### 🚀 Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/sachit03/Chat-Application.git
   cd Chat-Application
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment**
   - Duplicate `.env.example` as `.env`
   - Fill in your MySQL credentials and `JWT_SECRET`

4. **Run migrations**
   ```bash
   npx sequelize db:migrate
   ```

5. **Start the server**
   ```bash
   npm start
   ```
6. **Open in browser**:  
   http://localhost:8004

---

### 🎯 Features

- User signup & login with JWT authentication
- Real-time one-to-one and group chat
- Profile management (avatar upload using `multer`)
- Chat history persisted in MySQL
- Typing indicators and online status

---

### 🛠️ Usage

- **Sign Up**: Create a new account via the signup form.
- **Login**: Authenticate and receive a JWT token.
- **Chat**: Select a user or group to start chatting in real time.
- **Profile**: Upload and update your profile picture.

---

### 📁 Project Structure

```text
├── config/           # Database & environment config
├── controllers/      # Route handlers
├── models/           # Sequelize models
├── public/           # Static assets (CSS, client JS)
├── routes/           # Express routes
├── sockets/          # Socket.io event logic
├── middleware/       # Auth & error-handling
└── app.js            # Entry point
```

---

### 🔗 Useful Links

- [API Documentation](docs/API.md)
- [Client Demo Video](https://youtu.be/your-demo)
- [Issues](https://github.com/sachit03/Chat-Application/issues)

---

### 🤝 Contributing

1. Fork the repo
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

### 📜 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

### 🙋‍♂️ Contact

- **Author**: Sachit
- **GitHub**: [@sachit03](https://github.com/sachit03)
- **Email**: rajimang@gmail.com

