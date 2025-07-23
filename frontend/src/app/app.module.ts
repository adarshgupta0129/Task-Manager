import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TaskEntryComponent } from './components/task-entry/task-entry.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskLogComponent } from './components/task-log/task-log.component';

@NgModule({
  declarations: [
    AppComponent,
    TaskEntryComponent,
    TaskListComponent,
    TaskLogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }