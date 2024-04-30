# GIG.com

GIG.com is a platform designed to connect artists and venues for gigs. This project is a full-stack application built with React for the frontend, Express for the backend, and PostgreSQL for the database. It utilizes JWT for authentication and authorization, and Socket.IO for real-time communication.

## Features

- **User Registration and Login**: Users can register as either an artist or a venue, and log in to their accounts.
- **Profile Management**: Users can view their profile, including details specific to their role (artist or venue).
- **Gig Posting**: Venues can post gigs, including details such as title, description, date, time, and pay.
- **Gig Discovery**: Artists can discover and view gigs posted by venues.
- **Review System**: Users can write and read reviews for other users.
- **Chat System**: Users can send messages to each other in real-time.
- **Authentication and Authorization**: The application uses JWT for secure authentication and authorization, ensuring that only authenticated users can access protected routes and perform actions based on their role.

## Setup

### Prerequisites

- Node.js and npm installed.
- PostgreSQL installed and running.
- A `.env` file with the necessary environment variables.

### Environment Variables

Create a `.env` file in the root of your project and add the following variables:

```
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=your_postgres_connection_string_here

```

- `JWT_SECRET`: A secret key used for signing JWT tokens.
- `DATABASE_URL`: The connection string to your PostgreSQL database.

### Installation

1. Clone the repository:

```
git clone https://github.com/yourusername/GIG.git
```

2. Navigate to the project directory:

```
cd GIG
```

3. Install the dependencies:

```
npm install
```

4. Start the server:

```
cd express
npm start/npm run dev
```

5. In a separate terminal, navigate to the `gig-react` directory and start the React development server:

```
cd gig-react
npm install
npm run dev
```

### Usage

- Open your browser and navigate to `http://localhost:5001` to access the React frontend.
- Use the provided forms to register, log in, and interact with the platform.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
