import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { StorageDebugComponent } from '../../components/storage-debug/storage-debug.component';

const routes: Routes = [
  {
    path: '',
    component: StorageDebugComponent
  }
];

@NgModule({
  declarations: [
    StorageDebugComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class StorageDebugModule { }
