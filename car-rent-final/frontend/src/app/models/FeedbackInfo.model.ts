export interface FeedbackInfo{
    author:string,
    carImageUrl:string,
    carModel:string,
    date:string,
    feedbackId:string,
    feedbackText:string,
    orderNo:string,
    rating:number,
}
export interface FeedbackInfoResponse{
    content:FeedbackInfo[]
}
export interface FeedbackRequest{
    bookingId:string,
    carId:string,
    clientId:string,
    rating:number,
    feedbackText:string
}
export interface FeedbackResponse{
    message?:string,
    feedbackId?:string,
    systemMessage?:string
}