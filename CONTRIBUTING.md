# Contributing to Conspecto

First off, thank you for considering contributing to Conspecto! It's people like you that make Conspecto such a great tool.

We welcome any type of contribution, not only code. You can help with:
* **Reporting a bug**
* **Discussing the current state of the code**
* **Submitting a fix**
* **Proposing new features**
* **Becoming a maintainer**

## Getting Started

### How to Contribute

#### Reporting Bugs

If you find a bug, please make sure to [open an issue](https://github.com/EgorMitin/conspecto/issues/new). Please include a title and clear description, as much relevant information as possible, and a code sample or an executable test case demonstrating the expected behavior that is not occurring.

#### Suggesting Enhancements

If you have an idea for a new feature or an enhancement to an existing one, please [open an issue](https://github.com/EgorMitin/conspecto/issues/new) to discuss it. This allows us to coordinate our efforts and prevent duplication of work.

#### Pull Requests

1.  Fork the repository and create your branch from `main`.
2.  Make sure your code lints.
3.  Issue that pull request!

### Development Setup

To get the development environment running, follow these steps:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/EgorMitin/conspecto.git
    cd conspecto
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables**
    ```bash
    cp .env.example .env.local
    ```
    Then, add your database URL, API keys, etc. to the `.env.local` file.

4.  **Run the development server**
    ```bash
    pnpm dev
    ```

5.  **Open [http://localhost:3000](http://localhost:3000)** to see the application.

## Styleguides

### Git Commit Messages

*   Use the present tense ("Add feature" not "Added feature").
*   Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
*   Limit the first line to 72 characters or less.
*   Reference issues and pull requests liberally after the first line.

### Code Style

We will be moving towards to using ESLint to enforce code style. Please run `pnpm lint` to check your code before submitting a pull request.

---

We look forward to your contributions!
