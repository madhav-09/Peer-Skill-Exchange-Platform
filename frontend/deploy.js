const ghpages = require('gh-pages');

ghpages.publish('build', {
  dotfiles: true,
  message: 'Deploying to GitHub Pages',
  cache: false,
  user: {
    name: 'Madhav Tiwari',
    email: 'tiwarimadhav2309@gmail.com'  
  }
}, function (err) {
  if (err) {
    console.error('❌ Deployment failed:', err);
  } else {
    console.log('✅ Deployment successful!');
  }
});
