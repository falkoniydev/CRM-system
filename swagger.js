import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "CRM Backend API",
			version: "1.0.0",
			description: "CRM tizimi uchun API hujjatlari",
		},
		servers: [
			{
				url: "http://localhost:5000", // Local URL
				description: "Local server",
			},
			{
				url: "https://crm-system.onrender.com", // Replace with your Render URL
				description: "Production server",
			},
		],
	},
	apis: ["./routes/*.js"], // API-laringiz joylashgan fayl yo'li
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app, port) => {
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
	console.log(
		`Swagger UI ishladi: http://localhost:${port}/api-docs (Local) yoki Production URL`
	);
};
