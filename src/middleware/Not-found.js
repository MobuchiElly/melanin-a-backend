const not_found = (req, res) => {
    res.status(404).send(`<div style='display:flex; flex-direction:column; align-items:center; margin: 20px 0 0 10px;'>
    <h1>Ooooooooooooops!!</h1>
    <p>The requested endpoint url can not be found</p>
    <a href='/' style='background:blue; color:#ffffff; padding:10px; border-radius:5px; text-decoration:none;'>Back Home</a>
    </div>`)
}

module.exports = not_found;