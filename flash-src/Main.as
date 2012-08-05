package  
{
	import flash.display.MovieClip;
	import flash.display.Sprite;
	import flash.system.Security;
	/**
	 * ...
	 * @author Garymar (Igor Molchanov)
	 * used module from: http://profdiletant.blogspot.com/2011/02/mjpeg-actionscript-mjpeg.html
	 */
	public class Main extends Sprite
	{
		private var vmjpg:VideoMJPEG;
		
		public function Main() 
		{
			var url = this.loaderInfo.parameters["url"];
			var vmjpg = new VideoMJPEG(url_host,url_port,url_file);
			addChild(vmjpg);
			
		}
	}
}