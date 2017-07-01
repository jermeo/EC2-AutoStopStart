# EC2-AutoStopAndStart

* This nodejs application for AWS Lambda is a rewrite of existing python and nodejs scripts.

* It give you the ability of auto stop and start EC2 instances wich are tagged with `auto:stop` and `auto:start`.

* Values of this tags are CRON expressions (http://www.cronmaker.com/).

* **Examples:**
    
    * Auto-stop instance every day at 7pm : `0 0 7 * * *`
    * Auto-start instance every day at 8:30am : `0 30 8 * * *`
    
* Installation

* Create a lambda

* Policy