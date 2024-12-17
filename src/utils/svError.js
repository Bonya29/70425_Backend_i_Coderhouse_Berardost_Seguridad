export const iSvError = (res, error ) => {
    console.log(error)
    res.status(500).json({error:`Internal Server Error`})
}