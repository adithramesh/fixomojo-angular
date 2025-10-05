import { createFeature, createReducer, on } from "@ngrx/store"
import { BookingActions, BookingFormData } from "./booking.action"


export interface BookingState {
    formData:Partial<BookingFormData> | null,
    
}

export const initialState: BookingState ={
    formData: null,
}


export const bookingFeature = createFeature({
    name:'booking',
    reducer:createReducer(
        initialState,
        on(BookingActions.updateFormData,(state,{formData})=>({
            ...state,
            formData:{...state.formData,...formData}
        })),
        on(BookingActions.clearFormData,()=>initialState)
    )
})

export const {
    name: bookingFeatureKey,
    reducer: bookingReducer,
    selectBookingState,
    selectFormData
} = bookingFeature