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
    let getAllTodosQuery = "";
    const { search_q = "", priority, status } = request.query;

    switch (true) {
        case hasPriorityAndStatus(request.query):
            getAllTodosQuery = `
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
            getAllTodosQuery = `
            SELECT
              *
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}%'
              AND status = '${status}';`;
            break;
        case hasPriority(request.query):
            getAllTodosQuery = `
            SELECT
              *
            FROM
              todo
            WHERE
              todo Like '%${search_q}%'
              AND priority = '${priority}';`;
            break;
        default:
            getAllTodosQuery = `
            SELECT
              *
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}%';`;
            break;
    };

    todos = await db.all(getAllTodosQuery);

    response.send(todos);
});


// Get ToDo item by ToDO Id
app.get("/todos/:todoId/", async(request, response) => {
    const { todoId } = request.params;

    const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
    
    const todo = await db.get(getTodoQuery);

    response.send(todo);
});


// Create ToDo item
app.post("/todos/", async(request, response) => {
    const { id, todo, status, priority } = request.body;

    const addTodoQuery = `
    INSERT INTO
      todo (id, todo, status, priority)
    VALUES
      ('${id}', '${todo}', '${status}', '${priority}');`;

    await db.run(addTodoQuery);

    response.send("Todo Successfully Added");
});


// Update Todo Item by ToDO Id
app.put("/todos/:todoId/", async(request, response) => {
    const { todoId } = request.params;

    let updateTodoQuery = "";

    let updatedColumn = "";

    const requestBody = request.body;

    switch (true) {
        case requestBody.status !== undefined:

            const { status } = request.body;

            updatedColumn = "Status";

            updateTodoQuery = `
            UPDATE
              todo
            SET
              status = '${status}'
            WHERE
              id = ${ todoId };`;

            break;

        case requestBody.priority !== undefined:

            const { priority } = request.body;

            updatedColumn = "Priority";

            updateTodoQuery = `
            UPDATE
              todo
            SET
              priority = '${priority}'
            WHERE
              id = ${ todoId };`;

            break;

        case requestBody.todo !== undefined:

            const { todo } = request.body;

            updatedColumn = "Todo";

            updateTodoQuery = `
            UPDATE
              todo
            SET
              todo = '${ todo }'
            WHERE
              id = ${ todoId };`;

            break;
    };

    await db.run(updateTodoQuery);

    response.send(`${updatedColumn} Updated`);
});






module.exports = app;