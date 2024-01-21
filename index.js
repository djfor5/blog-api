import createError from "http-errors"
import express from "express"
import mongoose from "mongoose"
import adminRouter from "./routes/adminRoutes.js"
import userRouter from "./routes/userRoutes.js"
import postRouter from "./routes/postRoutes.js"
import commentRouter from "./routes/commentRoutes.js"

const app = express()

app.use(express.json())
// app.use(express.urlencoded({ extended: false }));
mongoose.set("strictQuery", false);
const mongoDb = process.env.MONGODB_URI
mongoose.connect(mongoDb)

app.use('/api/admin', adminRouter)
app.use('/api/users', userRouter)
app.use('/api/posts', postRouter)
app.use('/api/comments', commentRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: res.locals.error });
});

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Server listening on PORT ${PORT}`))