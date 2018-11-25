echo $1
git add *
git commit -m "$1"
git push -u origin master
echo Number of commits
git rev-list --count HEAD
