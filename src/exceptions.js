class NikeLoginError extends Error {
    constructor(data){
      super('Can\'t login')
      this.data = data
      Error.captureStackTrace(this, NikeLoginError)
    }
}
class NikeError extends Error {
    constructor(message){
        super(message)
        Error.captureStackTrace(this, NikeError)
    }
}
class NikeApiChange extends Error {
    constructor(data){
        super('Api url or result change')
        this.data = data
        Error.captureStackTrace(this, NikeApiChange)
    }
}
export {NikeLoginError, NikeError, NikeApiChange}