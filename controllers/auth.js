exports.signup = (req, res) => {
    console.log(req.body)
    res.json({
        data: 'You hit signup endpoint'
    })
}