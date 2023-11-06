const express = require('express')
const app = express()
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

app.use(express.json())
const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

module.exports = app

const connectDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server connected')
    })
  } catch (e) {
    console.log(`error : ${e.message}`)
    process.exit(1)
  }
}
connectDbServer()

//api 1

const hasStatusProperty = a => {
  return a.status !== undefined
}
const hasPriorityProperty = a => {
  return a.priority !== undefined
}
const hasStatusAndPriorityProperty = a => {
  return a.status !== undefined && a.priority !== undefined
}

app.get('/todos/', async (request, response) => {
  let dbData = null
  let dbQuery = ''
  let {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityProperty(request.query):
      dbQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}';`

      break

    case hasStatusProperty(request.query):
      dbQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}';`

      break

    case hasStatusAndPriorityProperty(request.query):
      dbQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}' AND priority = '${priority}';`

      break

    default:
      dbQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`
  }

  dbData = await db.all(dbQuery)
  response.send(dbData)
})

//api 2

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let dbQuery = ` SELECT * FROM todo WHERE id = ${todoId};`
  let dbData1 = await db.get(dbQuery)
  response.send(dbData1)
})

//api3

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  let dbQuery = `INSERT INTO todo(id,todo,priority,status) Values (${id},'${todo}','${priority}','${status}');`
  await db.run(dbQuery)
  response.send('Todo Successfully Added')
})

//api5

app.delete('/todos/:todoId/', (request, response) => {
  const {todoId} = request.params
  let dbQuery = `DELETE FROM todo WHERE id = ${todoId};`
  await db.run(dbQuery)
  response.send('Todo Deleted')
})

//api4

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const {todo = '', priority = '', status = ''} = request.query
  let dbQuery = ''

  if (todo === '' && priority === '') {
    dbQuery = ` UPDATE todo SET status = '${status}' WHERE id = ${todoId};`
    await db.run(dbQuery)
    response.send('Status Updated')
  } else if (priority === '' && status === '') {
    dbQuery = ` UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`
    await db.run(dbQuery)
    response.send('Todo Updated')
  } else if (status === '' && todo === '') {
    dbQuery = ` UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`
    await db.run(dbQuery)
    response.send('Priority Updated')
  }
})
