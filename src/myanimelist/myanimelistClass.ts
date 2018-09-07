export class myanimelistClass{
  readonly page: "detail"|null = null;

  //detail
  readonly id: number|null = null;
  readonly type: "anime"|"manga"|null = null;


  constructor(public url:string){
    var urlpart = utils.urlPart(url, 3);
    if(urlpart == 'anime' || urlpart == 'manga'){
      this.page = 'detail';
      this.id = utils.urlPart(url, 4);
      this.type = urlpart;
    }
  }

  init(){
    con.log(this);
    switch(this.page) {
      case 'detail':
        this.thumbnails();
        this.malToKiss();
        this.siteSearch();
        break;
      default:
        con.log('This page has no scipt')
    }
  }

  thumbnails(){
    con.log('Lazyloaded Images')
    if(this.url.indexOf("/pics") > -1){
      return;
    }
    if(this.url.indexOf("/pictures") > -1){
      return;
    }
    if(api.settings.get('malThumbnail') == "0"){
      return;
    }
    var height = parseInt(api.settings.get('malThumbnail'));
    var width = Math.floor(height/144*100);

    var surHeight = height+4;
    var surWidth = width+4;
    api.storage.addStyle('.picSurround img:not(.noKal){height: '+height+'px !important; width: '+width+'px !important;}');
    api.storage.addStyle('.picSurround img.lazyloaded.kal{width: auto !important;}');
    api.storage.addStyle('.picSurround:not(.noKal) a{height: '+surHeight+'px; width: '+surWidth+'px; overflow: hidden; display: flex; justify-content: center;}');

    try{
      window.onload = function(){ overrideLazyload(); };
      document.onload = function(){ overrideLazyload(); };
    }catch(e){
      $(document).ready(function(){ overrideLazyload(); });
    }

    function overrideLazyload() {
      var tags = document.querySelectorAll(".picSurround img:not(.kal)");
      var url = '';
      for (var i = 0; i < tags.length; i++) {
        var regexDimensions = /\/r\/\d*x\d*/g;
        if(tags[i].hasAttribute("data-src")){
          url = tags[i].getAttribute("data-src")!;
        }else{
          url = tags[i].getAttribute("src")!;
        }

        if ( regexDimensions.test(url) || /voiceactors.*v.jpg$/g.test(url) ) {
          if(!(url.indexOf("100x140") > -1)){
            tags[i].setAttribute("data-src", url);
            url = url.replace(/v.jpg$/g, '.jpg');
            tags[i].setAttribute("data-srcset", url.replace(regexDimensions, ''));
            tags[i].classList.add('lazyload');
          }
          tags[i].classList.add('kal');
        }else{
          tags[i].closest(".picSurround")!.classList.add('noKal');
          tags[i].classList.add('kal');
          tags[i].classList.add('noKal');
        }
      }
    }
  }

  async malToKiss(){
    utils.getMalToKissArray(this.type, this.id).then((links) => {
      con.log('test', links);
      var html = '';
      for(var pageKey in links){
        var page = links[pageKey];

        var tempHtml = '';
        var tempUrl = '';
        for(var streamKey in page){
          var stream = page[streamKey];
          tempHtml += '<div class="mal_links"><a target="_blank" href="'+stream['url']+'">'+stream['title']+'</a></div>';
          tempUrl = stream['url'];
        }
        html += '<h2 id="'+pageKey+'Links" class="mal_links"><img src="https://www.google.com/s2/favicons?domain='+tempUrl.split('/')[2]+'"> '+pageKey+'</h2>';
        html += tempHtml;
        html += '<br class="mal_links" />';

      }
      $('h2:contains("Information")').before(html);
    })
  }

  siteSearch(){
    $('h2:contains("Information")').before('<h2 id="mal-sync-search-links" class="mal_links">Search</h2><br class="mal_links" />');
    $('#mal-sync-search-links').one('click', () => {
      var titleEncoded = encodeURI($('#contentWrapper > div:first-child span').text());
      var html =
      `<div class="mal_links">
        <a target="_blank" href="http://www.crunchyroll.com/search?q=${titleEncoded}">
          Crunchyroll <img src="https://www.google.com/s2/favicons?domain=crunchyroll.com">
        </a>
        <a target="_blank" href="https://www.google.com/search?q=${titleEncoded}+site:crunchyroll.com">
          <img src="https://www.google.com/s2/favicons?domain=google.com">
        </a>
      </div>`;
      $('#mal-sync-search-links').after(html);
    });
  }
}
