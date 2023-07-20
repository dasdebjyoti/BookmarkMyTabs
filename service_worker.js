console.log("Background Service-Worker Start");

const sOurBookmarkFolder = "BookmarkMyTabs";
const cParentIdBmkBar = '1';    // 1 = Bookmarks bar. 2 = Other bookmarks
const cParentIdBmkOther = '2';  // 1 = Bookmarks bar. 2 = Other bookmarks
const cOurParentId = cParentIdBmkBar;

chrome.action.onClicked.addListener((tab) => {

  // Search for our bookmark folder
  chrome.bookmarks.search( {
    title: sOurBookmarkFolder
  },
  function(treeNode) {

    if (treeNode.length != 0) {

      console.log("Bookmark folders found: " + treeNode.length);

      // Find the oldest folder that was created
      // Ignore any other folder with the same name that the user may have created
      let ourFolderNode = treeNode[0];
      for (const node of treeNode) {
        if (cOurParentId == node.parentId && node.dateAdded < ourFolderNode.dateAdded)
        {
          console.log("Node: " + node.id + " Date Added: " + node.dateAdded);
          ourFolderNode = node;
        }
      }

      //console.log("Oldest node: " + ourFolderNode.id + " Date Added: " + ourFolderNode.dateAdded);
  
      if (cOurParentId == ourFolderNode.parentId) {
        console.log("Bookmark folder id: " + ourFolderNode.id);
        console.log("Bookmark folder index: " + ourFolderNode.index);
        console.log("Bookmark folder parentId: " + ourFolderNode.parentId);
        // Create our bookmarks
        bookmarkOpenTabs(treeNode[0]);
      }
      else {
        // Folder not found inside cOurParentId
        console.log("Bookmark folder not found in the correct location");
        addFolderAndBmkTabs();
      }
    }
    else {
      console.log("Bookmark folder not found");
      addFolderAndBmkTabs();
    };
  });
});

// Bookmark open tabs under the given node
// Param node: A BookmarkTreeNode object
function bookmarkOpenTabs(node)
{
  chrome.bookmarks.getChildren(
    node.id.toString(),
    function(bmkList)
    {
      
      chrome.tabs.query({}, function(tabs) {
        let bFound = false;
        tabs.forEach(function(tab) {

          // Check if the bookmark already exists
          if (0 < bmkList.length)
          {
            console.log('Existing bookmarks: ' + bmkList.length);
            bFound = false;
            for (const bmk of bmkList)
            {
              if (tab.title == bmk.title && tab.url == bmk.url) {
                bFound = true;
                break;
              }
            }
          }

          if (false == bFound)
          {
            chrome.bookmarks.create( {
              parentId: node.id.toString(),
              title: tab.title,
              url: tab.url
            },
            () => {
              console.log('Bookmark added: ' + tab.title);
            });
          }
        });
      });
    });
}

// Add our bookmark folder and bookmark open tabs
function addFolderAndBmkTabs()
{
  chrome.bookmarks.create( {
    parentId: cOurParentId,
    title: sOurBookmarkFolder
  },
  function(newFolder) {
    console.log("Created bookmark folder: " + newFolder.title);
    bookmarkOpenTabs(newFolder);
  });
}

console.log("Background Service-Worker End");
