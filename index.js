function allowDrop(e) {
	e.preventDefault()
}

function drag(e) {
	e.dataTransfer.setData("color", e.target.style.background)
	e.dataTransfer.setData("position", e.target.id)
}

function drop(e) {
	e.preventDefault()
	var data = e.dataTransfer.getData("color")
	e.target.parentElement.position = e.dataTransfer.getData("position")
	e.target.style.fill = data
	e.target.style.stroke = data
}

function makeColors(length) {
	colors = document.getElementById('colors')
	while (colors.firstChild) {
		colors.removeChild(colors.firstChild);
	}
	const hue = Math.random()*360
	return Array(length).fill().map((element,i)=>{
		const div = document.createElement('div')
		div.id = i
		div.style.background = `hsl(${hue},${90-(i*8)}%,${90-(i*8)}%)`
		div.draggable = true
		div.addEventListener('dragstart',drag)
		colors.appendChild(div)
	})
}

function makeDestinations(collection) {
	destinations = document.getElementById('destinations')
	while (destinations.firstChild) {
		destinations.removeChild(destinations.firstChild);
	}
	collection.map(shape=>shape
		.then(file=>{
			const tmp = document.createElement('div')
			tmp.innerHTML = file
			const svg = placeRandom(
				tmp.firstChild,
				{h:[15,90],w:[10,90]},
				Array.from(destinations.childNodes)
					.map(node=>({top:node.style.top,left:node.style.left})))
			svg.position = null
			svg.addEventListener('drop',drop)
			svg.addEventListener('dragover',allowDrop)
			destinations.appendChild(svg)
		})
	)
}

function placeRandom(element,limits,existing) {
	function randomPosition(limits){
		const top =  Math.round(Math.random() * (limits.h[1]-limits.h[0])) + limits.h[0]
		const left = Math.round(Math.random() * (limits.w[1]-limits.w[0])) + limits.w[0]
		return {top,left}
	}
	function checkProximity(pos,existing,r){
		if(existing.length == 0) return false
		return existing
			.map(val=>({
				top:  parseInt(val.top.replace(/vw|vh/,'')),
				left: parseInt(val.left.replace(/vw|vh/,''))
			}))
			.filter(val=>
				val.top  < pos.top+r  && val.top  > pos.top-r &&
				val.left < pos.left+r && val.left > pos.left-r )
			.length
	}

	do{
		var pos = randomPosition(limits)
		// console.log(checkProximity(pos,existing,10)?'collision!':'')
	} while(checkProximity(pos,existing,10))

	element.style.position = 'fixed'
	element.style.top = `${pos.top}vh`
	element.style.left = `${pos.left}vw`
	return element
}

function checkFilled(){
	const collection = Array.from(document.getElementById('destinations').childNodes)
	return collection
		.filter(svg=>svg.position!=null)
		.length == collection.length
}

function checkOrdered(){
	const collection = Array.from(document.getElementById('destinations').childNodes)
	const ascending = collection
		.filter(svg=>parseInt(svg.position) == parseInt(svg.getElementsByTagName('title')[0].innerHTML.slice(-1)))
		.length === collection.length
	const descending = collection
		.filter(svg=>parseInt(collection.length-1-svg.position) == parseInt(svg.getElementsByTagName('title')[0].innerHTML.slice(-1)))
		.length === collection.length
	console.log(ascending,descending)
	console.log(collection.map(svg=>svg.position+' '+svg.getElementsByTagName('title')[0].innerHTML).sort())
	return ascending || descending
}

function render(i){
	makeDestinations(shapes[i])
	makeColors(shapes[i].length)
	return ++i
}

// Get Shapes

const shapes = Array(9)
	.fill()
	.map((_,j)=>Array(9)
		.fill()
		.map((_,k)=>fetch(`assets/${j}${k}.svg`)
			.then(res=>res.text())
			.catch(err=>console.error(err))
		)
	)


// Event Loop

Promise
	.all(shapes.map(Promise.all, Promise))
	.then(_=>{
		let level = render(0)
		setInterval(()=>{
			// Change the && to an || to ignore ordering
			if(checkFilled() && checkOrdered()){
				if(level===9) level = 0
				level = render(level)
			}
		},500)
	})
