import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { TaskBoardComponent } from './components/task-board/task-board.component';
import { TaskCardComponent } from './components/task-card/task-card.component';
import { AiChatComponent } from './components/ai-chat/ai-chat.component';
import { ChatControlsComponent } from './components/chat-controls/chat-controls.component';

@NgModule({
  declarations: [
    AppComponent,
    TaskBoardComponent,
    TaskCardComponent,
    AiChatComponent,
    ChatControlsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    DragDropModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }