const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;


// Initialization
const initializeDbAndServer = async() => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log("Server Running at http://localhost:3000");
        });
    } catch(e) {
        console.log(`DBError: ${e.message}`);
    };
};

initializeDbAndServer();


//Check for Status and Priority in Query Parameters
const hasPriorityAndStatus = (requestQuery) => {
    return(
        requestQuery.priority !== undefined && requestQuery.status !== undefined
    );
};


//Check for Status in Query Parameters
const hasStatus = (requestQuery) => {
    return requestQuery.status !== undefined;
};


//Check for Priority in Query Parameters
const hasPriority = (requestQuery) => {
    return requestQuery.priority !== undefined;
};




// Get All ToDo items with Different Query Parameters
app.get("/todos/", async(request, response) => {
    let getTodosQuery = "";
    const { search_q = "", priority, status } = request.query;

    switch (true) {
        case hasPriorityAndStatus(request.query):
            getTodosQuery = `
            SELECT
              *
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}%'
              AND status = '${status}'
              AND priority = '${priority}';`;
            break;
        case hasStatus(request.query):
            getTodosQuery = `
            SELECT
              *
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}%'
              AND status = '${status}';`;
            break;
        case hasPriority(request.query):
            getTodosQuery = `
            SELECT
              *
            FROM
              todo
            WHERE
              todo Like '%${search_q}%'
              AND priority = '${priority}';`;
            break;
        default:
            getTodosQuery = `
            SELECT
              *
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}%';`;
            break;
    };

    todos = await db.all(getTodosQuery);

    response.send(todos);
});






module.exports = app;