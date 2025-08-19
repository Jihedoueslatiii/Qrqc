# QRQC Dashboard Frontend

This project is the frontend for the QRQC (Quick Response Quality Control) dashboard, designed to monitor and manage action plans for industrial KPIs such as Qualité, Coût, and Délai. Built with Angular, it provides interactive charts, filtering, and CRUD operations for KPI analyses and action plans.

## Features

- 📊 **Dashboard**: Visualize KPIs (Qualité, Coût, Délai) with global and per-program charts using Chart.js.
- 📝 **Action Plans**: Add, view, and manage action plans for each KPI and program.
- 🔍 **Filtering**: Filter data by KPI, pilot, and date range for detailed analysis.
- 📈 **Statistics**: View average results and trends for each KPI category.
- 🛡️ **Authentication**: Secure access to dashboard features (if backend is configured).
- ⚡ **Responsive UI**: Modern, mobile-friendly design using Tailwind CSS.

## Technologies

- **Angular** (TypeScript)
- **Chart.js** (with chartjs-plugin-datalabels)
- **RxJS**
- **Tailwind CSS**

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- Angular CLI

### Installation
```bash
npm install
```

### Running the App
```bash
ng serve
```
Visit [http://localhost:4200](http://localhost:4200) in your browser.

## Project Structure
```
front/
  src/
    app/
      components/
        monitoring/        # Main dashboard component
        ...                # Other feature components
      services/            # API and business logic
      models/              # TypeScript interfaces
    assets/                # Images and icons
    environments/          # Environment configs
  angular.json             # Angular config
  package.json             # Dependencies
```

## API & Backend
This frontend is designed to work with a QRQC backend (REST API). Configure API endpoints in `src/environments/environment.ts`.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
MIT

## Author
Jihed Oueslati

---
For more information, see the code comments and documentation in each component.
