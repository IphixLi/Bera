const projectName="chloropleth map";

var body=d3.select("body");
var svg=d3.select("svg");

//tooltip declaration

var tooltip=body
.append("div")
.attr("class", "tooltip")
.attr("id","tooltip")
.style("opacity",0);

var path=d3.geoPath();
var x=d3.scaleLinear()
.domain([2.6,75.1])
.rangeRound([600,860]);

var color=d3.
scaleThreshold()
.domain(d3.range(2.6, 75.1, (75.1-2.6)/8))
.range(d3.schemePurples[9]);

var g=svg
.append("g")
.attr("class","key")
.attr("id","legend")
.attr("transform", "translate(0,40)");

g.selectAll("rect")
.data(
color.range().map(function(d){
  d=color.invertExtent(d);
  if(d[0]===null){
    d[0]=x.domain()[0];
  }if(d[1]===null){
    d[1]=x.domain()[1];
  }
  return d;
  })
)
.enter()
.append("rect")
.attr("height",8)
.attr("x",function(d){
 return !isNaN(x(d[0]))?x(d[0]):0;
})
.attr("width",function(d){
 return  !isNaN(x(d[1])-x(d[0]))?x(d[1])-x(d[0]):0;
})
.attr("fill", function(d){
 return color(d[0]);
});

function findwidth(x,d) {
  var temp = x(d[1]) - x(d[0]);
  return isNaN(temp)?0:temp
  }

g.call(
d3.axisBottom(x)
.tickSize(13)
.tickFormat(function(x){
return  Math.round(x)+"%";
})
  .tickValues(color.domain())
)
.select(".domain")
.remove();

const EDUCATION_FILE =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const COUNTY_FILE =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';
d3.queue()
.defer(d3.json,COUNTY_FILE)
.defer(d3.json,EDUCATION_FILE)
.await(ready);

function ready(error,us,education){
  if(error){
    throw error;
  }
  
svg
.append("g")
  .attr("class","counties")
  .selectAll("path")
  .data(topojson.feature(us, us.objects.counties).features)
  .enter()
  .append("path")
  .attr("class","county")
  .attr("data-fips",function(d){
  return d.id;
})
  
 .attr("data-education",function(d){
  var result=education.filter(function(obj){
   return obj.fips===d.id;
  });
  if(result[0]){
    return result[0].bachelorsOrHigher;
  }
  console.log("could find data for: ",d.id);
  return 0;
})
  .attr("fill",function(d){
  var result=education.filter(function(obj){
  return obj.fips===d.id;
  });
  if(result[0]){
    return color(result[0].bachelorsOrHigher);
  }
  return color(0);
})
 .attr("d",path)
  .on("mouseover",function(d){
  tooltip.style("opacity",0.9);
  tooltip.html(function(){
    var result=education.filter(function(obj){
      return obj.fips===d.id;
    });
    if(result[0]){
      return(
        result[0]['area_name']+
        ", "+result[0]["state"]+
        ": "+
        result[0].bachelorsOrHigher+
        "%"
      );
    }
    return 0;          
  })
  .attr("data-education",function(){
    var result=education.filter(function(obj){
      return obj.fips===d.id;
 });
    if(result[0]){
      return result[0].bachelorsOrHigher;
    }
    return 0;
  })
  .style("left",d3.event.pageX+10+"px")
  .style("top",d3.event.pageY-28+"px");
})
  .on("mouseout",function(){
  tooltip.style("opacity",0);
});
 
  svg
  .append("path")
  .datum(
  topojson.mesh(us, us.objects.states, function(a,b){
    return a!==b;
  })
  )
  .attr("class","states")
  .attr("d",path);
}