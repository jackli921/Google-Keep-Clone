class App {
    constructor(){
        //below are properties on objects being created
        this.notes = JSON.parse(localStorage.getItem('notes')) || []
        this.title = ''
        this.text = ''
        this.id = ''

        this.$notes = document.querySelector('#notes')
        this.$placeholder = document.querySelector('#placeholder')
        this.$form =  document.querySelector('#form') // $ sign for HTML elements, no $ for data 
        this.$noteTitle = document.querySelector('#note-title')
        this.$noteText = document.querySelector('#note-text')
        this.$formButtons = document.querySelector('#form-buttons')
        this.$formCloseButton = document.querySelector('#form-close-button')
        this.$modal = document.querySelector('.modal')
        this.$modalTitle = document.querySelector('.modal-title')
        this.$modalText = document.querySelector('.modal-text')
        this.$modalCloseButton = document.querySelector('.modal-close-button')
        this.$colorToolTip = document.querySelector('#color-tooltip')

        this.render() // call to display existing notes each time an new note is made
        this.addEventListeners()
    }
    
    addEventListeners() {
        document.body.addEventListener('click', e=>{
            this.handleFormClick(e)
            this.selectNote(e) //let constructor get selected value and populate modal input before displaying modal 
            this.openModal(e)
            this.closeModal(e)
            this.deleteNote(e)
        })

        document.body.addEventListener('mouseover', e=>
            this.openToolTip(e)
        )

        document.body.addEventListener('mouseout', e=>
            this.closeToolTip(e)
        )

        // use function declaration to refer to the element itself
        this.$colorToolTip.addEventListener('mouseover', function(){
            this.style.display = 'flex' //refers to the element itself, i.e. the color tooltip div
        })

        this.$colorToolTip.addEventListener('mouseout',function(){
            this.style.display = 'none'
        })

        this.$colorToolTip.addEventListener('click', e=>{
            const color = e.target.dataset.color
            if(color){
                this.editNoteColor(color)
            }

        })



        this.$form.addEventListener('submit', e=>{
            e.preventDefault()
            const title = this.$noteTitle.value
            const text = this.$noteText.value
            const hasNote = title || text 

            if (hasNote){
               this.addNote({ title, text})
            }

        })
        this.$formCloseButton.addEventListener('click',e=>{
            e.stopPropagation() //stops event from propagating to parent element i.e. form
            this.closeForm() 
        })

        this.$modalCloseButton.addEventListener('click', e=>{
            e.stopPropagation()
            this.closeModal(e)
        })
    }

    handleFormClick(e){
        const isFormClicked = this.$form.contains(e.target) // contain checks if clicked element is within the form box
        const title = this.$noteTitle.value
        const text = this.$noteText.value
        const hasNote = title || text 

        if(isFormClicked){
            this.openForm()
        }
        else if(hasNote){
            this.addNote({title, text})
        }
        else{
            this.closeForm()
        }
    }

    openForm(){
        this.$form.classList.add("form-open")
        this.$noteTitle.style.display = "block"
        this.$formButtons.style.display = "block"
    }

    closeForm(){
        this.$form.classList.remove("form-open")
        this.$noteTitle.style.display = "none"
        this.$formButtons.style.display = "none"
        this.$noteTitle.value = "" 
        this.$noteText.value = ""
    }

    renderNote(e){
        this.$modalTitle.value = ``
        this.$modalText.value = ``
    }

    openModal(e){
        if(e.target.matches('.toolbar-delete')) return  //if target element is the delete element, don't do anything 
        if(e.target.closest('.note')){ //.closest determines if a click is closest to a element with a certain class i.e. class="note"
            this.$modal.classList.toggle('open-modal')
            this.$modalTitle.value = this.title
            this.$modalText.value = this.text
        } 
    }

    closeModal(e){
        if(e.target.matches('.modal')|| e.target.matches('.modal-close-button')){
            this.editNote()
            this.$modal.classList.toggle('open-modal')
        }
    }

    openToolTip(e){
        if(!e.target.matches('.toolbar-color')) return //do nothing for invalid mouseover
        this.id = e.target.dataset.id  //puts id into the constructor again
        // add page scroll to tooltip;
        const noteCoords = e.target.getBoundingClientRect()
        const horizontal = noteCoords.left + window.scrollX
        const vertical = noteCoords.top + window.scrollY

        this.$colorToolTip.style.transform = `translate(${horizontal}px, ${vertical}px)`
        this.$colorToolTip.style.display = "flex"
    
    }

    closeToolTip(e){
        if(!e.target.matches('.toolbar-color'))return 
        this.$colorToolTip.style.display = "none"
    }

 
    addNote({title, text}){
        const newNote = {
            title,
            text,
            color: 'white',
            id: this.notes.length > 0 ? this.notes[this.notes.length - 1].id + 1: 1
            // if array.length = 1, index always = 0, make id = array length by + 1 to last item in the index
        }
        this.notes = [...this.notes, newNote] //spread previous note, then add new note
        this.render()
        this.closeForm()
    }

    selectNote(e){
        const $selectedNote = e.target.closest('.note')  //select the clicked note
        if($selectedNote){
            const [$noteTitle, $noteText] = $selectedNote.children
            // JavaScript uses the order in which the variables are declared to determine which properties to assign to them
            
            this.title = $noteTitle.innerText //assign the the text inside selected note onto modal's input field 
            this.text = $noteText.innerText
            this.id = $selectedNote.dataset.id
        }
    }

    deleteNote(e){
        e.stopPropagation()
        if(!e.target.matches('.toolbar-delete')) return 
        const id = e.target.dataset.id

        this.notes = this.notes.filter(note=>
            note.id !== Number(id) 
            )
        this.render()
    }

    render(){
        this.saveNotes()
        this.displayNotes()
    }

    saveNotes(){
        localStorage.setItem('notes', JSON.stringify(this.notes))
    }

    editNote(){
        const title = this.$modalTitle.value 
        const text = this.$modalText.value

        this.notes = this.notes.map(note => //create new master array by mapping 
            note.id === Number(this.id) ? {...note, title,  text } : note //data-id attributes are strings while object id are numbers
        )
        this.render() //Use updated master array to render the whole page 
    }

    editNoteColor(color){
        this.notes = this.notes.map(note=>
            note.id === Number(this.id) ? { ...note, color }: note 
        )
        this.render()
    }

    displayNotes(){
        const hasNotes = this.notes.length > 0
        this.$placeholder.style.display = hasNotes ? "none" : "flex"
        
        this.$notes.innerHTML = this.notes.map(note=>`
            <div style="background: ${note.color};" class="note" data-id="${note.id}">
                <div class="${note.title && "note-title"}">${note.title}</div>
                <div class="note-text">${note.text}</div>
                <div class="toolbar-container">
                    <div class="toolbar">
                        <img class="toolbar-color" data-id=${note.id} src="images/palette.svg">
                        <img class="toolbar-delete" data-id=${note.id} src="images/trash-can.svg">
                    </div>   
                </div>
            </div>

        `).join("")

    }
}   

new App()