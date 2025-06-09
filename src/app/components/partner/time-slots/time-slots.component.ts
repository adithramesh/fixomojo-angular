// import { Component, inject } from '@angular/core';
// import { TimeSlotDTO, DaySlotsDTO } from '../../../models/time-slot.model';
// import { Observable } from 'rxjs';
// import { Store } from '@ngrx/store';
// import { selectTempUserId } from '../../../store/auth/auth.reducer';


// @Component({
//   selector: 'app-time-slots',
//   imports: [],
//   templateUrl: './time-slots.component.html',
//   styleUrl: './time-slots.component.scss'
// })
// export class TimeSlotsComponent {
//   weeklySlots:DaySlotsDTO[]=[]
//   availableHours: string[] = [
//     '09:00', '10:00', '11:00', '12:00', '13:00',
//     '14:00', '15:00', '16:00', '17:00'
//   ];
//   isLoading:boolean=false;
//   successMessage:string='';
//   errorMessage: string = '';
//   private technicianId$!:Observable<string|null>;
//   private _store=inject(Store)
  
//   ngOnInit():void{
//     this.technicianId$= this._store.select(selectTempUserId)

    
//   }

//   generateWeeklySlots():void{
//       this.weeklySlots=[]
//       const today = new Date();
//       today.setHours(0,0,0,0)

//       for(let i=0;i<7;i++){
//         const currentDate=new Date(today)
//         currentDate.setDate(today.getDate()+i)

//         const daySlots:DaySlotsDTO={
//           date:currentDate,
//           dateString:currentDate.toDateString().split('T')[0],
//           dayName:currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
//           timeSlots:
//         }
//       }
//     }

//     generateDayTimeSlots(dateString:string):TimeSlotDTO[]{

//     }
// }
