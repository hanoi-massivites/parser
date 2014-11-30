var graph = require('fbgraph');
var fs = require('fs');

var HANOI_MASSIVE_ID = '273615232725656';
var ENDING_DATE = new Date('2014-10-1');

var access_token = fs.readFileSync('access_token');
graph.setAccessToken(access_token);


// 1 Get a batch of posts
// 2 Sort them by creation date
// 3 Preprocess and save each post
// 4 Process next page

var sort_by_date = function (a, b) {
    return new Date(a.created_time) - new Date(b.created_time)
}


var posts = [];

var handler = function (err, res) {
    // FIXME: What to actually do on error?
    if (err) {
        console.log(err);
        return;
    } else {
        console.log('got a new batch');
    }

    var batch = res['data'];

    // Sort by creation date
    batch.sort(sort_by_date);
    console.log(batch[0].created_time);

    // Find the oldest one in the batch that is still newer than our
    // ENDING_DATE
    is_last_batch = false;
    for (var i = batch.length - 1; i >= 0; --i) {
        if (new Date(batch[i].created_time) < ENDING_DATE) {
            is_last_batch = true;
            batch = batch.slice(i + 1, batch.length);
            break;
        }
    }

    posts = posts.concat(batch);

    if (!is_last_batch && res.paging && res.paging.next) {
        graph.get(res.paging.next, handler);
    }

    if (is_last_batch) {
        console.log(posts.length);

        posts.sort(sort_by_date);
        fs.writeFileSync('posts.json', JSON.stringify(posts, null, 4));
    }
}

graph.get(HANOI_MASSIVE_ID + '/feed', {'limit': 25}, handler);
