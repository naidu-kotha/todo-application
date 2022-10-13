const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

// Initialization
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DBError: ${e.message}`);
  }
};

initializeDbAndServer();


const databaseObjects = (dbObj) => {
  return {
    id: dbObj.id,
    todo: dbObj.todo,
    category: dbObj.category,
    priority: dbObj.priority,
    status: dbObj.status,
    dueDate: dbObj.due_date,
  };
};


const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};


const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};


const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};


const hasSearchProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};


// Get All Todo API
app.get("/todos/", async (request, response) => {
  try {
    const { search_q = "", priority, status, category } = request.query;

    let getAllTodosQuery;
    let todos;

    switch (true) {
        case hasStatusProperty(request.query):
            if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
                getAllTodosQuery = `
                    SELECT
                    *
                    FROM
                    todo
                    WHERE
                    todo LIKE '%${search_q}%'
                    AND status = '${status}';`;

            todos = await db.all(getAllTodosQuery);
            response.send(todos.map((item) => databaseObjects(item)));
            } else {
                response.status(400);
                response.send("Invalid Todo Status");
            };
            break;
        case hasCategoryProperty(request.query):
            if (category === "WORK" || category === "HOME" || category === "LEARNING") {
                getAllTodosQuery = `
                    SELECT
                    *
                    FROM
                    todo
                    WHERE
                    todo LIKE '%${search_q}%'
                    AND category = '${category}';`;

                todos = await db.all(getAllTodosQuery);
                response.send(todos.map((item) => databaseObjects(item)));
            } else {
                response.status(400);
                response.send("Invalid Todo Category");
        };
        break;
        case hasPriorityProperty(request.query):
            if (priority === ("HIGH" || "MEDIUM" || "LOW")) {
                getAllTodosQuery = `
                    SELECT
                    *
                    FROM
                    todo
                    WHERE
                    todo LIKE '%${search_q}%'
                    AND priority = '${priority}';`;

                todos = await db.all(getAllTodosQuery);
                response.send(todos.map((item) => databaseObjects(item)));
            } else {
                response.status(400);
                response.send("Invalid Todo Priority");
        };
        break;
        case hasSearchProperty(request.query):
            getAllTodosQuery = `
                SELECT
                *
                FROM
                todo
                WHERE
                todo LIKE '%Buy%';`;

            todos = await db.all(getAllTodosQuery);
            response.send(todos.map((item) => databaseObjects(item)));
        break;
        default:
            getTodoObjQuery = `
                SELECT  
                  * 
                FROM
                  todo;`;

            data = await db.all(getTodoObjQuery);
            response.send(data.map((item) => databaseObjects(item)));
    };
  } catch (e) {
    console.log(`DBError: ${e.message}`);
  };
});


// Get ToDo item by ToDO Id API
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

    response.send(databaseObjects(todo));
});


// Get ToDo item by Due Date
app.get("/agenda/", async(request, response) => {
    try {
        const { date } = request.query;

        const valid = isValid(new Date(date));
        console.log(valid);

        if (valid === true){
            const result = format(new Date(date), 'yyyy-MM-dd');
            console.log(result);

            const getTodoByDateQuery = `
                SELECT
                  *
                FROM
                  todo
                WHERE
                  due_date = '${ result }';`;

            const todos = await db.all(getTodoByDateQuery);
            response.send(todos.map((item) => databaseObjects(item)));
        } else {
            response.status(400);
            response.send("Invalid Due Date")
        };
    } catch (e) {
        console.log(`DBError: ${e.message}`);
    };
});


// Create  ToDo item
app.post("/todos/", async(request, response) => {
    try {const { id, todo, category, priority, status, dueDate } = request.body;

    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {

        if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {

             if (category === "WORK" || category === "HOME" || category === "LEARNING") {

                 if (isValid(new Date(dueDate)) === true) {

                    const date = format(new Date(dueDate), 'yyyy-MM-dd');

                    const createTodoQuery = `
                    INSERT INTO
                      todo
                    VALUES('${id}', '${todo}', '${category}', '${priority}', '${status}', '${dueDate});`;

                    const todo = await db.get(createTodoQuery);
                    console.log(databaseObjects(todo))
                    response.send("Todo Successfully Added");
                 } else {
                    response.status(400);
                 };
             };
        };
    };
} catch (e) {
    console.log(`DBError: ${e.message}`);
};
});








// Delete ToDo Item by ToDO Id API
app.delete("/todos/:todoId/", async(request, response) => {
    const { todoId } = request.params;

    const deleteTodoQuery = `
    DELETE FROM
      todo
    WHERE
      id = ${ todoId };`;

    await db.run(deleteTodoQuery);

    response.send("Todo Deleted");
});


module.exports = app;
