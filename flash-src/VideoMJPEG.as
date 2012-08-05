package  
{
   import flash.display.*;
   import flash.events.Event;
   import flash.events.ProgressEvent;
   import flash.net.*;
   import flash.utils.*;

   public class VideoMJPEG extends Sprite
   {
      private var _stream:URLStream = new URLStream();
      private var _loader:Loader = new Loader()
      private var _buffer:ByteArray;
      private var _write:Boolean = false;   
      private var _markerDetection:Boolean = false;   
      private var _request:URLRequest;

      public function VideoMJPEG(url)
      {
         mouseEnabled = false;
         mouseChildren = false;
		 _request = new URLRequest(url);
         addEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
		 
      }
      
      private function onAddedToStage(e:Event):void 
      {
         removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
         
         addChild(_loader);
         
         _stream.load(_request);
         _stream.addEventListener(ProgressEvent.PROGRESS, onProgress);
      }
      
      private function onProgress(event:ProgressEvent):void
      {
         var byte:int;

         // Если есть доступные байты - обработать их 
         while(_stream.bytesAvailable > 0)
         {
            byte = _stream.readUnsignedByte();
            if(_write) _buffer.writeByte(byte);
            if(_markerDetection)
            {
               switch(byte)
               {
                  case 0xD8:
                     _write = true;
                     _buffer = new ByteArray();
                     _buffer.writeByte(0xFF);
                     _buffer.writeByte(0xD8);
                  break;
                  case 0xD9:
                     _write = false;
                     _buffer.writeByte(0xD9);
                     _loader.loadBytes(_buffer);
                  break;
               }
 
            }
            _markerDetection = (byte == 0xFF);
         } 
      }
   }
}