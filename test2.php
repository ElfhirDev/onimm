<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Test 2 Mind map</title>

    <!-- Bootstrap -->
    <link href="css/bootstrap.min.css" rel="stylesheet">

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
    <style type="text/css" media="screen">

      body {
        padding-top: 50px;
      }

      svg .draggable { cursor: move; }

      .dragging {
        fill: red;
        stroke: brown;
      }

      .axis line {
        fill: none;
        stroke: #ddd;
        shape-rendering: crispEdges;
        vector-effect: non-scaling-stroke;
      }

    </style>
  </head>
  <body>

    <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="#">Onisep Mind Map</a>
        </div>
        <div class="collapse navbar-collapse">
          <ul class="nav navbar-nav">
            <li><a href="http://www.jeremy-ta.fr/work/onisep/d3/test1.php">Test 1</a></li>
            <li class="active"><a href="#">Test 2</a></li>
            <li><a href="http://www.jeremy-ta.fr/work/onisep/d3/test3.php">Test 3</a></li>
          </ul>
        </div><!--/.nav-collapse -->
      </div>
    </div>

    <div class="container">
      <div class="starter-template">
          <h1>D3 Test 2</h1>
          <h2 class="lead">Mind mapping</h2>
          <div id="onimm_"></div>

      </div>
    </div>

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <!--script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script-->
    <script src="js/libs/jquery-1.8.2.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="js/libs/bootstrap.min.js"></script>
    <script src="js/libs/d3.min.js"></script>
    <script src="js/onimm.js"></script>
  </body>
</html>
