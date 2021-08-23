nmcli radio wifi off
sudo macchanger -r wlp2s0
nmcli radio wifi om
pm2 restart all
pm2 logs